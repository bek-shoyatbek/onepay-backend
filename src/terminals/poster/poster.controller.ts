import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PosterService } from './poster.service';
import { CloseTransactionDto } from './dto';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    console.log(body);
  }

  @Put('close-transaction')
  async closeTransaction(@Body() closeTransactionDto: CloseTransactionDto) {
    return this.posterService.closeTransaction(closeTransactionDto);
  }

  @Get('transactions')
  async getTransactions(
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

    return this.posterService.getTransactions(
      queryParams.dateFrom,
      queryParams.dateTo,
    );
  }
}
