import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentServicesService } from './payment-services.service';
import { InitTransactionDto } from './dto/init-transaction.dto';
import { RKeeperParams } from 'src/types/rkeeper-params';

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
    console.log('initTransactionDto', initTransactionDto);
    return await this.paymentServicesService.initTransaction(
      initTransactionDto,
    );
  }

  @Get('rkeeper')
  @HttpCode(HttpStatus.OK)
  async generateURLForRKeeper(@Query() params: RKeeperParams) {
    return await this.paymentServicesService.generateURLForRKeeper(params);
  }
}
