import { Injectable, Param, Query } from '@nestjs/common';
import { InitTransactionDto } from './dto/init-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RedirectingService } from 'src/utils/redirecting/redirecting.service';
import { RKeeperParams } from 'src/types/rkeeper-params';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentServicesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redirectingService: RedirectingService,
    private readonly configService: ConfigService,
  ) {}

  async initTransaction(initTransactionDto: InitTransactionDto) {
    const newTransaction = await this.prismaService.transactions.create({
      data: {
        amount: initTransactionDto.amount,
        provider: initTransactionDto.provider,
        tip: initTransactionDto.tip,
        status: 'INIT',
      },
    });

    const paymentPageURL = this.redirectingService.generateRedirectUrl(
      initTransactionDto.provider,
      {
        amount: initTransactionDto.amount + initTransactionDto.tip,
        transactionId: newTransaction.id,
      },
    );

    return { url: paymentPageURL };
  }

  async generateURLForRKeeper(params: RKeeperParams) {
    const UI_URL = this.configService.get('UI_URL');
    return `${UI_URL}/pay?orderId=${params.guid}&total=${params.amount}&spotId=${params.name}`;
  }
}
