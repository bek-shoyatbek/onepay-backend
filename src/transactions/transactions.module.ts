import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedirectingService } from 'src/utils/redirecting/redirecting.service';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    PrismaService,
    RedirectingService,
    HashingService,
  ],
})
export class TransactionsModule {}
