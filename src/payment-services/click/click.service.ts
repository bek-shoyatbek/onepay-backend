import { Injectable } from '@nestjs/common';
import { ClickRequestDto } from './dto/click-request.dto';
import { TransactionActions } from './constants/transaction-actions';
import { ObjectId } from 'mongodb';
import { PrismaService } from 'src/prisma.service';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { ConfigService } from '@nestjs/config';
import { log } from 'node:console';
import { ClickError } from 'src/enums';

@Injectable()
export class ClickService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
  ) { }

  async handleMerchantTransactions(clickReqBody: ClickRequestDto) {
    const actionType = +clickReqBody.action;
    clickReqBody.amount = parseFloat(clickReqBody.amount + '');

    if (isNaN(actionType)) {
      return {
        error: ClickError.ActionNotFound,
        error_note: 'Invalid action',
      };
    }

    if (actionType == TransactionActions.Prepare) {
      return this.prepare(clickReqBody);
    } else if (actionType == TransactionActions.Complete) {
      return this.complete(clickReqBody);
    } else {
      return {
        error: ClickError.ActionNotFound,
        error_note: 'Invalid action',
      };
    }
  }

  async prepare(clickReqBody: ClickRequestDto) {
    const secretKey = this.configService.get<string>('CLICK_SECRET');

    const transactionId = clickReqBody.merchant_trans_id;
    const amount = clickReqBody.amount;
    const transId = clickReqBody.click_trans_id + ''; // ! in db transId is string

    const md5Hash = this.hashingService.md5(
      `${clickReqBody.click_trans_id}${clickReqBody.service_id}${secretKey}${transactionId}${clickReqBody.amount}${clickReqBody.action}${clickReqBody.sign_time}`,
    );
    const isValidSignature = this.verifyMd5Hash(
      clickReqBody.sign_string,
      md5Hash,
    );

    if (!isValidSignature) {
      return {
        error: ClickError.SignFailed,
        error_note: 'Invalid sign_string',
      };
    }

    const isAlreadyPaid = await this.prismaService.transactions.findFirst({
      where: {
        id: transactionId,
        status: 'PAID',
      },
    });

    if (isAlreadyPaid) {
      return {
        error: ClickError.AlreadyPaid,
        error_note: 'Already paid',
      };
    }

    const isCancelled = await this.prismaService.transactions.findFirst({
      where: {
        id: transactionId,
        status: 'CANCELED',
      },
    });

    if (isCancelled) {
      return {
        error: ClickError.TransactionCanceled,
        error_note: 'Cancelled',
      };
    }

    const transaction = await this.prismaService.transactions.findFirst({
      where: {
        transId: transId,
      },
    });

    if (transaction && transaction.status == 'CANCELED') {
      return {
        error: ClickError.TransactionCanceled,
        error_note: 'Transaction canceled',
      };
    }

    const time = new Date().getTime();

    log('click:transactionId', transactionId);

    await this.prismaService.transactions.update({
      where: {
        id: transactionId,
      },
      data: {
        status: 'PENDING',
        amount: amount,
        transId: transId,
        prepareId: time,
        provider: 'click',
        createdAt: new Date(time),
      },
    });

    return {
      click_trans_id: +transId,
      merchant_trans_id: transactionId,
      merchant_prepare_id: time,
      error: ClickError.Success,
      error_note: 'Success',
    };
  }

  async complete(clickReqBody: ClickRequestDto) {
    const transactionId = clickReqBody.merchant_trans_id;
    const prepareId = clickReqBody.merchant_prepare_id;
    const transId = clickReqBody.click_trans_id + '';
    const serviceId = clickReqBody.service_id;
    const amount = clickReqBody.amount;
    const signTime = clickReqBody.sign_time;
    const error = clickReqBody.error;

    const secretKey = this.configService.get<string>('CLICK_SECRET');
    const md5Hash = this.hashingService.md5(
      `${transId}${serviceId}${secretKey}${transactionId}${prepareId}${amount}${clickReqBody.action}${signTime}`,
    );
    const isValidSignature = this.verifyMd5Hash(
      clickReqBody.sign_string,
      md5Hash,
    );

    if (!isValidSignature) {
      return {
        error: ClickError.SignFailed,
        error_note: 'Invalid sign_string',
      };
    }

    const isValidTransactionId = this.checkObjectId(transactionId);

    if (!isValidTransactionId) {
      return {
        error: ClickError.BadRequest,
        error_note: 'Invalid transactionId',
      };
    }

    const transaction = await this.prismaService.transactions.findUnique({
      where: {
        id: transactionId,
      },
    });

    const isPrepared = await this.prismaService.transactions.findFirst({
      where: {
        id: transactionId,
        prepareId: +clickReqBody.merchant_prepare_id,
        status: 'PENDING',
      },
    });

    if (!isPrepared) {
      return {
        error: ClickError.TransactionNotFound,
        error_note: 'Invalid merchant_prepare_id',
      };
    }

    const isAlreadyPaid = await this.prismaService.transactions.findFirst({
      where: {
        id: transactionId,
        prepareId: +clickReqBody.merchant_prepare_id,
        status: 'PAID',
      },
    });

    if (isAlreadyPaid) {
      return {
        error: ClickError.AlreadyPaid,
        error_note: 'Already paid',
      };
    }

    if (parseInt(`${amount}`) !== transaction.amount) {
      return {
        error: ClickError.InvalidAmount,
        error_note: 'Invalid amount',
      };
    }

    if (transaction && transaction.status == 'CANCELED') {
      return {
        error: ClickError.TransactionCanceled,
        error_note: 'Already cancelled',
      };
    }

    if (error > 0) {
      await this.prismaService.transactions.update({
        where: {
          id: transactionId,
        },
        data: {
          status: 'CANCELED',
          cancelTime: new Date(),
        },
      });
      return {
        error: error,
        error_note: 'Failed',
      };
    }

    // update payment status
    await this.prismaService.transactions.update({
      where: {
        id: transactionId,
      },
      data: {
        status: 'PAID',
        performTime: new Date(),
      },
    });

    return {
      click_trans_id: +clickReqBody.click_trans_id,
      merchant_trans_id: transactionId,
      error: ClickError.Success,
      error_note: 'Success',
    };
  }

  private checkObjectId(id: string) {
    return ObjectId.isValid(id);
  }

  private verifyMd5Hash(incomingSign: string, mySign: string) {
    return incomingSign == mySign;
  }
}
