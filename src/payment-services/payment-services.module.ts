import { Module } from '@nestjs/common';
import { PaymentServicesService } from './payment-services.service';
import { PaymentServicesController } from './payment-services.controller';
import { PrismaService } from 'src/prisma.service';
import { RedirectingService } from 'src/utils/redirecting/redirecting.service';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentServicesController],
  providers: [
    PaymentServicesService,
    PrismaService,
    RedirectingService,
    HashingService,
  ],
})
export class PaymentServicesModule {}
