import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymeService } from './payme.service';
import { RequestBody } from './types/incoming-request-body';
import { PaymeBasicAuthGuard } from 'src/auth/guards/payme.guard';
import { Response } from 'express';

@Controller('payme')
export class PaymeController {
  constructor(private readonly paymeService: PaymeService) { }


  @Post()
  @UseGuards(PaymeBasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async handleTransactionMethods(@Body() reqBody: RequestBody, @Res() res: Response) {

    console.log("reqBody: ", reqBody);
    const result = await this.paymeService.handleTransactionMethods(reqBody);

    res.status(HttpStatus.OK).send(result);
    return;
  }
}
