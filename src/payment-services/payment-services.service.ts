import { Injectable } from '@nestjs/common';
import { InitTransactionDto } from './dto/init-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RedirectingService } from 'src/utils/redirecting/redirecting.service';

@Injectable()
export class PaymentServicesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redirectingService: RedirectingService,
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
}
