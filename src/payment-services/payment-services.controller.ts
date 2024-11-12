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
import { RkeeperService } from 'src/rkeeper/rkeeper.service';

@Controller('payment')
export class PaymentServicesController {
  constructor(
    private readonly paymentServicesService: PaymentServicesService,
    private readonly rkeeperService: RkeeperService,
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
