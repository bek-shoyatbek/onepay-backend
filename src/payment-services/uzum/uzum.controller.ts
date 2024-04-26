import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UzumService } from './uzum.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CheckTransactionDto } from './dto/check-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

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
  async confirm(@Body() reqBody: any) {
    return await this.uzumService.confirm(reqBody);
  }

  @UseGuards(AuthGuard)
  @Post('reverse')
  async reverse(@Body() reqBody: any) {
    return await this.uzumService.reverse(reqBody);
  }

  @UseGuards(AuthGuard)
  @Post('status')
  async status(@Body() reqBody: any) {
    return await this.uzumService.status(reqBody);
  }
}
