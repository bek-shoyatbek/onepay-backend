import { Injectable } from '@nestjs/common';
import { InitTransactionDto } from './dto/init-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RedirectingService } from 'src/utils/redirecting/redirecting.service';
import { PaymentProvider, Terminal } from 'src/enums';

@Injectable()
export class PaymentServicesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redirectingService: RedirectingService,
  ) {}

  async initTransaction(initTransactionDto: InitTransactionDto) {
    console.log('initTransactionDto: ', initTransactionDto);
    const isTipOnly = initTransactionDto.isTipOnly;
    const newTransaction = await this.prismaService.transaction.create({
      data: {
        amount: isTipOnly ? initTransactionDto.tip : initTransactionDto.total,
        provider: initTransactionDto.provider,
        isTipOnly,
        userId: initTransactionDto.userId,
        orderId: initTransactionDto.orderId,
        tip: initTransactionDto.tip,
        tableId: initTransactionDto.spotTabletId,
        terminal: initTransactionDto.terminal as Terminal,
        spotId: initTransactionDto.spotId,
        status: 'INIT',
      },
    });

    console.log('newTransaction: ', newTransaction);
    const paymentPageURL = this.redirectingService.generateRedirectUrl(
      initTransactionDto.provider as PaymentProvider,
      {
        amount: initTransactionDto.total + initTransactionDto.tip,
        transactionId: newTransaction.id,
      },
    );

    return { url: paymentPageURL };
  }
}
