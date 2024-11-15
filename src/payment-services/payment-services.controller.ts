import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentServicesService } from './payment-services.service';
import { InitTransactionDto } from './dto/init-transaction.dto';

@Controller('payment')
export class PaymentServicesController {
  constructor(
    private readonly paymentServicesService: PaymentServicesService,
  ) { }

  @Post('init')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  @HttpCode(HttpStatus.OK)
  async initTransaction(@Body() initTransactionDto: InitTransactionDto) {
    return await this.paymentServicesService.initTransaction(
      initTransactionDto,
    );
  }

}
