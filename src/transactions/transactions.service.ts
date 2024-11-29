import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RedirectingService } from 'src/utils/redirecting/redirecting.service';
import { PaymentProvider, Terminal } from 'src/shared/enums';
import { CreateTransactionDto } from './dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redirectingService: RedirectingService,
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    console.log('createTransactionDto: ', createTransactionDto);
    const isTipOnly = createTransactionDto.isTipOnly;
    const newTransaction = await this.prismaService.transaction.create({
      data: {
        amount: createTransactionDto.total,
        provider: createTransactionDto.provider,
        userId: createTransactionDto.userId,
        orderId: createTransactionDto.orderId,
        tip: createTransactionDto.tip,
        isTipOnly,
        tableId: createTransactionDto.spotTabletId,
        terminal: createTransactionDto.terminal as Terminal,
        spotId: createTransactionDto.spotId,
        status: 'INIT',
      },
    });
    console.log('newTransaction: ', newTransaction);
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
