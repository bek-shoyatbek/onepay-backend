import { BadRequestException, Injectable } from '@nestjs/common';
import { CheckTransactionDto } from './dto/check-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { ErrorStatusCode } from './constants/error-status-codes';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ConfigService } from '@nestjs/config';
import { ResponseStatus } from './constants/response-status';
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { CheckTransactionStatusDto } from './dto/check-status.dto';
import { ObjectId } from 'mongodb';
import { error, info, log } from 'console';

@Injectable()
export class UzumService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async check(checkTransactionDto: CheckTransactionDto) {
    const isValidServiceId = this.checkServiceId(checkTransactionDto.serviceId);

    if (!isValidServiceId) {
      error('Invalid service id');
      throw new BadRequestException({
        serviceId: checkTransactionDto.serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    info('checkTransactionDto', checkTransactionDto);

    const isValidObjectId = ObjectId.isValid(
      checkTransactionDto.params.transactionId,
    );

    if (!isValidObjectId) {
      error('Invalid plan id');
      throw new BadRequestException({
        serviceId: checkTransactionDto.serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: checkTransactionDto.params.transactionId,
      },
    });

    if (!transaction) {
      error('Transaction not found');
      throw new BadRequestException({
        serviceId: checkTransactionDto.serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    if (transaction.status !== 'INIT') {
      error('Transaction already exists');
      throw new BadRequestException({
        serviceId: checkTransactionDto.serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    info('Transaction found', transaction);

    return {
      serviceId: checkTransactionDto.serviceId,
      timestamp: new Date().valueOf(),
      status: ResponseStatus.Ok,
      data: {
        account: {
          value: checkTransactionDto.params.transactionId,
        },
      },
    };
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const transactionId = createTransactionDto.params.transactionId;
    const serviceId = createTransactionDto.serviceId;
    const transId = createTransactionDto.transId;

    if (!this.checkServiceId(serviceId)) {
      error('Invalid service id');
      throw new BadRequestException({
        serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }
    info('createTransactionDto', createTransactionDto);

    const isExistingTransaction =
      await this.prismaService.transaction.findFirst({
        where: {
          transId,
        },
      });

    if (isExistingTransaction && isExistingTransaction.status !== 'INIT') {
      error('Transaction already exists');
      throw new BadRequestException({
        serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      error('Invalid transaction id');
      throw new BadRequestException({
        serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    log(transaction.amount, createTransactionDto.amount);

    const isValidAmount =
      transaction.amount === createTransactionDto.amount / 100; // ! incoming amount is in tiyn
    if (!isValidAmount) {
      error('Invalid amount');
      throw new BadRequestException({
        serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    await this.prismaService.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        transId,
        status: 'PENDING',
        provider: 'uzum',
        createdAt: new Date(),
      },
    });

    return {
      serviceId,
      timestamp: new Date().valueOf(),
      status: ResponseStatus.Created,
      transTime: new Date().valueOf(),
      transId,
      amount: createTransactionDto.amount,
    };
  }

  async confirm(confirmTransactionDto: ConfirmTransactionDto) {
    const serviceId = confirmTransactionDto.serviceId;
    const transId = confirmTransactionDto.transId;

    if (!this.checkServiceId(serviceId)) {
      error('Invalid service id');
      throw new BadRequestException({
        serviceId,
        transId,
        status: ResponseStatus.Failed,
        confirmTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.InvalidServiceId,
      });
    }

    info('confirmTransactionDto', confirmTransactionDto);

    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        transId,
      },
    });

    if (!transaction) {
      error('Invalid transaction id');
      throw new BadRequestException({
        serviceId,
        transId,
        status: ResponseStatus.Failed,
        confirmTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.AdditionalPaymentPropertyNotFound,
      });
    }

    if (transaction.status !== 'PENDING') {
      error('Payment already processed');
      throw new BadRequestException({
        serviceId,
        transId,
        status: ResponseStatus.Failed,
        confirmTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.PaymentAlreadyProcessed,
      });
    }

    if (transaction.provider !== 'uzum') {
      error('Payment already processed');
      throw new BadRequestException({
        serviceId,
        transId,
        status: ResponseStatus.Failed,
        confirmTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.PaymentAlreadyProcessed,
      });
    }

    await this.prismaService.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        performTime: new Date(),
        status: 'PAID',
      },
    });

    return {
      serviceId,
      transId,
      status: ResponseStatus.Confirmed,
      confirmTime: new Date().valueOf(),
    };
  }

  async reverse(reverseTransactionDto: ReverseTransactionDto) {
    const serviceId = reverseTransactionDto.serviceId;
    const transId = reverseTransactionDto.transId;

    if (!this.checkServiceId(serviceId)) {
      error('Invalid service id');
      throw new BadRequestException({
        serviceId,
        transId,
        status: ResponseStatus.Failed,
        reverseTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.InvalidServiceId,
      });
    }

    info('reverseTransactionDto', reverseTransactionDto);

    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        transId,
      },
    });

    if (!transaction) {
      error('Invalid transaction id');
      throw new BadRequestException({
        serviceId,
        transId,
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.AdditionalPaymentPropertyNotFound,
      });
    }

    await this.prismaService.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        cancelTime: new Date(),
        status: 'CANCELED',
      },
    });
    return {
      serviceId,
      transId,
      status: ResponseStatus.Reversed,
      reverseTime: new Date().valueOf(),
      amount: transaction.amount,
    };
  }

  async status(checkTransactionDto: CheckTransactionStatusDto) {
    const serviceId = checkTransactionDto.serviceId;
    const transId = checkTransactionDto.transId;

    if (!this.checkServiceId(serviceId)) {
      error('Invalid service id');
      throw new BadRequestException({
        serviceId,
        transId,
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.InvalidServiceId,
      });
    }

    info('checkTransactionDto', checkTransactionDto);

    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        transId,
      },
    });

    if (!transaction) {
      error('Invalid transaction id');
      throw new BadRequestException({
        serviceId,
        transId,
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.AdditionalPaymentPropertyNotFound,
      });
    }
    return {
      serviceId,
      transId,
      status: transaction.status,
    };
  }

  private checkServiceId(serviceId: number) {
    const myServiceId = this.configService.get<number>('UZUM_SERVICE_ID');

    return serviceId === +myServiceId;
  }
}
