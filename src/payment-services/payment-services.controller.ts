import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentServicesService } from './payment-services.service';
import { InitTransactionDto } from './dto/init-transaction.dto';
import { RKeeperParams } from 'src/types/rkeeper-params';
import { Response } from 'express';
import { RkeeperService } from 'src/rkeeper/rkeeper.service';

@Controller('payment')
export class PaymentServicesController {
  constructor(
    private readonly paymentServicesService: PaymentServicesService,
    private readonly rkeeperService: RkeeperService,
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
  async generateURLForRKeeper(
    @Query() params: RKeeperParams,
    @Res() res: Response,
  ) {
    console.log('incoming params', params);

    const response = await this.rkeeperService.generateURL(params);
    res.json(response);
    return;
  }
}
