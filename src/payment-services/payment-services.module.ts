import { Module } from '@nestjs/common';
import { PaymentServicesService } from './payment-services.service';
import { PaymentServicesController } from './payment-services.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PaymentServicesController],
  providers: [PaymentServicesService, PrismaService],
})
export class PaymentServicesModule {}
