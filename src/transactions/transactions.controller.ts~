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
  ) {}

  @Post('init')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  @HttpCode(HttpStatus.OK)
  async initTransaction(@Body() initTransactionDto: InitTransactionDto) {
    initTransactionDto.total = initTransactionDto.total * 100;
    initTransactionDto.tip = initTransactionDto.tip * 100;

    initTransactionDto.terminal = 'rkeeper';
    return await this.paymentServicesService.initTransaction(
      initTransactionDto,
    );
  }
}
