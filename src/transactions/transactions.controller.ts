import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post('')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  @HttpCode(HttpStatus.OK)
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    console.log('createTransactionDto: ', createTransactionDto);
    createTransactionDto.total = createTransactionDto.total * 100;
    createTransactionDto.tip = createTransactionDto.tip * 100;

    return await this.transactionsService.createTransaction(
      createTransactionDto,
    );
  }
}
