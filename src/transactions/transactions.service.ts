import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedirectingService } from 'src/utils/redirecting/redirecting.service';
import { PaymentProvider, Terminal } from 'src/shared/enums';
import { CreateTransactionDto } from './dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redirectingService: RedirectingService,
  ) { }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const isTipOnly = createTransactionDto.isTipOnly;
    const newTransaction = await this.prismaService.transaction.create({
      data: {
        amount: createTransactionDto.total,
        provider: createTransactionDto.provider,
        userId: createTransactionDto.userId,
        orderId:
          createTransactionDto.orderId ||
          'poster_' + Math.floor(Math.random() * 1000000),
        tip: createTransactionDto.tip,
        isTipOnly,
        accountUrl: createTransactionDto.accountUrl,
        tableId: createTransactionDto.tableId,
        terminal: createTransactionDto.terminal as Terminal,
        spotId: createTransactionDto.spotId,
        spotTabletId: createTransactionDto.spotTabletId,
        status: 'INIT',
      },
    });
    const redirectUrl = this.redirectingService.generateRedirectUrl(
      createTransactionDto.provider as PaymentProvider,
      {
        amount: createTransactionDto.total,
        transactionId: newTransaction.id,
      },
    );

    return { url: redirectUrl };
  }
}
