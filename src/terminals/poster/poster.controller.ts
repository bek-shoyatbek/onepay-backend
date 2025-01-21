import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
} from '@nestjs/common';
import { PosterService } from './poster.service';
import { CloseTransactionDto } from './dto';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) { }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    console.log(body);
  }

  @Put('close-transaction')
  async closeTransaction(@Body() closeTransactionDto: CloseTransactionDto) {
    console.log("closeTransactionDto: ", closeTransactionDto);
    return this.posterService.closeTransaction(closeTransactionDto);
  }

}
