import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PosterService } from './poster.service';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    console.log(body);
  }

  @Get('transactions/:transactionType')
  async getTransactions(
    @Param('transactionType') transactionType: 'dash' | 'transaction',
    @Query() queryParams: { dateFrom?: string; dateTo?: string },
  ) {
    if (!queryParams.dateFrom || !queryParams.dateTo) {
      throw new BadRequestException('dateFrom and dateTo are required');
    }

    const dateRegex = /^\d{8}$/;
    if (
      !dateRegex.test(queryParams?.dateFrom) ||
      !dateRegex.test(queryParams?.dateTo)
    ) {
      throw new BadRequestException(
        'dateFrom and dateTo must be in YYYYMMDD format',
      );
    }

    if (transactionType === 'dash') {
      return this.posterService.getDashTransactions(
        queryParams.dateFrom,
        queryParams.dateTo,
      );
    }

    if (transactionType === 'transaction') {
      return this.posterService.getTransactions(
        queryParams.dateFrom,
        queryParams.dateTo,
      );
    }

    throw new BadRequestException(
      'transactionType must be dash or transaction',
    );
  }
}
