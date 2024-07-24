import { Injectable } from '@nestjs/common';
import { InitTransactionDto } from './dto/init-transaction.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PaymentServicesService {
  constructor(private readonly prismaService: PrismaService) {}
  async initTransaction(initTransactionDto: InitTransactionDto) {
    const newTransaction = await this.prismaService.transactions.create({
      data: {
        amount: initTransactionDto.amount,
        provider: initTransactionDto.provider,
        tip: initTransactionDto.tip,
        status: 'INIT',
      },
    });

    return newTransaction;
  }
}
