import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { PosterService } from './poster.service';
import { GetTransactionsQueryParamsDto, TransactionPayloadDto } from './dto';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) { }

  @Post()
  @HttpCode(200)
  getPoster(@Body() body) {
    console.log(body);
  }

  @Get("transactions")
  async getTransactions(@Query() queryParams: GetTransactionsQueryParamsDto) {
    return await this.posterService.getTransactions(queryParams.dateFrom, queryParams.dateTo);
  }

  @Post("close-transaction")
  async closeTransaction(@Body() body: TransactionPayloadDto) {
    return await this.posterService.closeTransaction(body);
  }

}
