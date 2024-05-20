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

    const transaction = await this.prismaService.transactions.findUnique({
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
    const isValidServiceId = this.checkServiceId(
      createTransactionDto.serviceId,
    );

    if (!isValidServiceId) {
      error('Invalid service id');
      throw new BadRequestException({
        serviceId: createTransactionDto.serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }
    info('createTransactionDto', createTransactionDto);

    const isExistingTransaction =
      await this.prismaService.transactions.findFirst({
        where: {
          transId: createTransactionDto.transId,
        },
      });

    if (isExistingTransaction) {
      error('Transaction already exists');
      throw new BadRequestException({
        serviceId: createTransactionDto.serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    const isValidObjectId = ObjectId.isValid(
      createTransactionDto.params.planId,
    );

    if (!isValidObjectId) {
      error('Invalid account id');
      throw new BadRequestException({
        serviceId: createTransactionDto.serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    const transaction = await this.prismaService.transactions.findUnique({
      where: {
        id: createTransactionDto.params.transactionId,
      },
    });

    if (!transaction) {
      error('Invalid transaction id');
      throw new BadRequestException({
        serviceId: createTransactionDto.serviceId,
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
        serviceId: createTransactionDto.serviceId,
        timestamp: new Date().valueOf(),
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.ErrorCheckingPaymentData,
      });
    }

    await this.prismaService.transactions.update({
      where: {
        id: createTransactionDto.params.transactionId,
      },
      data: {
        status: 'PENDING',
        provider: 'uzum',
        createdAt: new Date(),
      },
    });

    return {
      serviceId: createTransactionDto.serviceId,
      timestamp: new Date().valueOf(),
      status: ResponseStatus.Created,
      transTime: new Date().valueOf(),
      transId: createTransactionDto.transId,
      amount: createTransactionDto.amount,
    };
  }

  async confirm(confirmTransactionDto: ConfirmTransactionDto) {
    const isValidServiceId = this.checkServiceId(
      confirmTransactionDto.serviceId,
    );

    if (!isValidServiceId) {
      error('Invalid service id');
      throw new BadRequestException({
        serviceId: confirmTransactionDto.serviceId,
        transId: confirmTransactionDto.transId,
        status: ResponseStatus.Failed,
        confirmTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.InvalidServiceId,
      });
    }

    info('confirmTransactionDto', confirmTransactionDto);

    const transaction = await this.prismaService.transactions.findFirst({
      where: {
        transId: confirmTransactionDto.transId,
      },
    });

    if (!transaction) {
      error('Invalid transaction id');
      throw new BadRequestException({
        serviceId: confirmTransactionDto.serviceId,
        transId: confirmTransactionDto.transId,
        status: ResponseStatus.Failed,
        confirmTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.AdditionalPaymentPropertyNotFound,
      });
    }

    if (transaction.status !== 'PENDING') {
      error('Payment already processed');
      throw new BadRequestException({
        serviceId: confirmTransactionDto.serviceId,
        transId: confirmTransactionDto.transId,
        status: ResponseStatus.Failed,
        confirmTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.PaymentAlreadyProcessed,
      });
    }

    if (transaction.provider !== 'uzum') {
      error('Payment already processed');
      throw new BadRequestException({
        serviceId: confirmTransactionDto.serviceId,
        transId: confirmTransactionDto.transId,
        status: ResponseStatus.Failed,
        confirmTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.PaymentAlreadyProcessed,
      });
    }

    await this.prismaService.transactions.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: 'PAID',
      },
    });

    return {
      serviceId: confirmTransactionDto.serviceId,
      transId: confirmTransactionDto.transId,
      status: ResponseStatus.Confirmed,
      confirmTime: new Date().valueOf(),
    };
  }

  async reverse(reverseTransactionDto: ReverseTransactionDto) {
    const isValidServiceId = this.checkServiceId(
      reverseTransactionDto.serviceId,
    );
    if (!isValidServiceId) {
      error('Invalid service id');
      throw new BadRequestException({
        serviceId: reverseTransactionDto.serviceId,
        transId: reverseTransactionDto.transId,
        status: ResponseStatus.Failed,
        reverseTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.InvalidServiceId,
      });
    }

    info('reverseTransactionDto', reverseTransactionDto);

    const transaction = await this.prismaService.transactions.findFirst({
      where: {
        transId: reverseTransactionDto.transId,
      },
    });

    if (!transaction) {
      error('Invalid transaction id');
      throw new BadRequestException({
        serviceId: reverseTransactionDto.serviceId,
        transId: reverseTransactionDto.transId,
        status: ResponseStatus.Failed,
        reverseTime: new Date().valueOf(),
        errorCode: ErrorStatusCode.AdditionalPaymentPropertyNotFound,
      });
    }

    await this.prismaService.transactions.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: 'CANCELED',
      },
    });
    return {
      serviceId: reverseTransactionDto.serviceId,
      transId: reverseTransactionDto.transId,
      status: ResponseStatus.Reversed,
      reverseTime: new Date().valueOf(),
      amount: transaction.amount,
    };
  }

  async status(checkTransactionDto: CheckTransactionStatusDto) {
    const isValidServiceId = this.checkServiceId(checkTransactionDto.serviceId);

    if (!isValidServiceId) {
      error('Invalid service id');
      throw new BadRequestException({
        serviceId: checkTransactionDto.serviceId,
        transId: checkTransactionDto.transId,
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.InvalidServiceId,
      });
    }

    info('checkTransactionDto', checkTransactionDto);

    const transaction = await this.prismaService.transactions.findFirst({
      where: {
        transId: checkTransactionDto.transId,
      },
    });

    if (!transaction) {
      error('Invalid transaction id');
      throw new BadRequestException({
        serviceId: checkTransactionDto.serviceId,
        transId: checkTransactionDto.transId,
        status: ResponseStatus.Failed,
        errorCode: ErrorStatusCode.AdditionalPaymentPropertyNotFound,
      });
    }
    return {
      serviceId: checkTransactionDto.serviceId,
      transId: checkTransactionDto.transId,
      status: transaction.status,
    };
  }

  private checkServiceId(serviceId: number) {
    const myServiceId = this.configService.get<number>('UZUM_SERVICE_ID');

    return serviceId === +myServiceId;
  }
}
