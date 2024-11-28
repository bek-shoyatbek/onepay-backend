import { Module } from '@nestjs/common';
import { PaymeService } from './payme.service';
import { PaymeController } from './payme.controller';
import { PrismaService } from 'src/prisma.service';
import { PaymeBasicAuthGuard } from 'src/transactions/providers/payme/guards/payme.guard';
import { ConfigModule } from '@nestjs/config';
import { RkeeperModule } from 'src/terminals/rkeeper/rkeeper.module';
import { RkeeperService } from 'src/terminals/rkeeper/rkeeper.service';
import { HttpModule } from '@nestjs/axios';
import { PosterService } from 'src/terminals/poster/poster.service';

@Module({
  imports: [ConfigModule, RkeeperModule, HttpModule],
  controllers: [PaymeController],
  providers: [
    PaymeService,
    PrismaService,
    PaymeBasicAuthGuard,
    RkeeperService,
    PosterService,
  ],
})
export class PaymeModule {}
