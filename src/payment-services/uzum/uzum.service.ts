import { Injectable } from '@nestjs/common';
import { CheckTransactionDto } from './dto/check-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { ErrorStatusCode } from './constants/error-status-codes';
import { ErrorResponseDto } from './dto/ErrorResponse.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ConfigService } from '@nestjs/config';
import { ResponseStatus } from './constants/response-status';

@Injectable()
export class UzumService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async check(checkTransactionDto: CheckTransactionDto) {
    const isValidServiceId =
      this.configService.get('UZUM_SERVICE_ID') ===
      checkTransactionDto.serviceId;

    if (!isValidServiceId) {
      const errorRes = new ErrorResponseDto(
        checkTransactionDto.serviceId,
        new Date().valueOf(),
        ResponseStatus.Failed,
        ErrorStatusCode.InvalidServiceId,
      );

      return errorRes.getResponse();
    }
    const isValidUserAccount = await this.prismaService.users.findUnique({
      where: {
        id: checkTransactionDto.params.account,
      },
    });

    if (!isValidUserAccount) {
      const errorRes = new ErrorResponseDto(
        checkTransactionDto.serviceId,
        new Date().valueOf(),
        ResponseStatus.Failed,
        ErrorStatusCode.ErrorCheckingPaymentData,
      );

      return errorRes.getResponse();
    }

    const successResponse = {
      serviceId: checkTransactionDto.serviceId,
      timestamp: new Date().valueOf(),
      status: ResponseStatus.Ok,
      params: {
        account: checkTransactionDto.params.account,
      },
    };

    return successResponse;
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const isValidServiceId = this.checkServiceId(
      createTransactionDto.serviceId,
    );

    if (!isValidServiceId) {
      const errorRes = new ErrorResponseDto(
        createTransactionDto.serviceId,
        new Date().valueOf(),
        ResponseStatus.Failed,
        ErrorStatusCode.InvalidServiceId,
      );
      return errorRes.getResponse();
    }

    const isValidUserAccount = await this.prismaService.users.findUnique({
      where: {
        id: createTransactionDto.params.account,
      },
    });

    if (!isValidUserAccount) {
      const errorRes = new ErrorResponseDto(
        createTransactionDto.serviceId,
        new Date().valueOf(),
        ResponseStatus.Failed,
        ErrorStatusCode.ErrorCheckingPaymentData,
      );
      return errorRes.getResponse();
    }

    const newTransaction = await this.prismaService.transactions.create({
      data: {
        transId: createTransactionDto.transId,
        amount: createTransactionDto.amount,
        timestamp: createTransactionDto.timestamp,
      },
    });

    return {
      serviceId: createTransactionDto.serviceId,
      timestamp: new Date().valueOf(),
      status: ResponseStatus.Created,
      transTime: new Date().valueOf(),
      transId: newTransaction.transId,
      amount: newTransaction.amount,
    };
  }

  async confirm(reqBody: any) {}

  async reverse(reqBody: any) {}

  async status(reqBody: any) {}

  private checkServiceId(serviceId: number) {
    return this.configService.get('UZUM_SERVICE_ID') === serviceId;
  }
}
