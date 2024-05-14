import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PaymentServicesService } from './payment-services.service';
import { InitTransactionDto } from './dto/init-transaction.dto';

@Controller('payment-services')
export class PaymentServicesController {
  constructor(
    private readonly paymentServicesService: PaymentServicesService,
  ) {}

  @Post('init')
  @HttpCode(HttpStatus.OK)
  async initTransaction(initTransactionDto: InitTransactionDto) {
    return await this.paymentServicesService.initTransaction(
      initTransactionDto,
    );
  }
}
