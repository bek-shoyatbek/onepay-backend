import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UzumService } from './uzum.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CheckTransactionDto } from './dto/check-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { CheckTransactionStatusDto } from './dto/check-status.dto';

@Controller('uzum')
export class UzumController {
  constructor(private readonly uzumService: UzumService) {}

  @UseGuards(AuthGuard)
  @Post('check')
  async check(@Body() checkTransactionDto: CheckTransactionDto) {
    return await this.uzumService.check(checkTransactionDto);
  }

  @UseGuards(AuthGuard)
  @Post('create')
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.uzumService.create(createTransactionDto);
  }

  @UseGuards(AuthGuard)
  @Post('confirm')
  async confirm(@Body() confirmTransactionDto: ConfirmTransactionDto) {
    return await this.uzumService.confirm(confirmTransactionDto);
  }

  @UseGuards(AuthGuard)
  @Post('reverse')
  async reverse(@Body() reverseTransactionDto: ReverseTransactionDto) {
    return await this.uzumService.reverse(reverseTransactionDto);
  }

  @UseGuards(AuthGuard)
  @Post('status')
  async status(@Body() checkTransactionStatusDto: CheckTransactionStatusDto) {
    return await this.uzumService.status(checkTransactionStatusDto);
  }
}
