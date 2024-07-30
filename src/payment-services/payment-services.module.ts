import { Module } from '@nestjs/common';
import { PaymentServicesService } from './payment-services.service';
import { PaymentServicesController } from './payment-services.controller';
import { PrismaService } from 'src/prisma.service';
import { RedirectingService } from 'src/utils/redirecting/redirecting.service';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { ConfigModule } from '@nestjs/config';
import { RkeeperModule } from 'src/rkeeper/rkeeper.module';
import { RkeeperService } from 'src/rkeeper/rkeeper.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [PaymentServicesController],
  providers: [
    PaymentServicesService,
    PrismaService,
    RedirectingService,
    HashingService,
    RkeeperService,
  ],
})
export class PaymentServicesModule {}
