import { Injectable } from '@nestjs/common';
import { InitTransactionDto } from './dto/init-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RedirectingService } from 'src/utils/redirecting/redirecting.service';

@Injectable()
export class PaymentServicesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redirectingService: RedirectingService,
  ) { }

  async initTransaction(initTransactionDto: InitTransactionDto) {
    const newTransaction = await this.prismaService.transactions.create({
      data: {
        amount: initTransactionDto.total + initTransactionDto.tip,
        provider: initTransactionDto.provider,
        userId: initTransactionDto.userId,
        orderId: initTransactionDto.orderId,
        tip: initTransactionDto.tip,
        status: 'INIT',
      },
    });

    console.log("newTransaction: ", newTransaction);
    const paymentPageURL = this.redirectingService.generateRedirectUrl(
      initTransactionDto.provider,
      {
        amount: initTransactionDto.total + initTransactionDto.tip,
        transactionId: newTransaction.id,
      },
    );

    return { url: paymentPageURL };
  }

}
