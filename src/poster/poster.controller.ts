import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PosterService } from './poster.service';
import { TransactionPayloadDto } from './dto';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) { }

  @Post()
  @HttpCode(200)
  getPoster(@Body() body) {
    console.log(body);
  }

  @Post("close-transaction")
  async closeTransaction(@Body() body: TransactionPayloadDto) {
    return await this.posterService.closeTransaction(body);
  }
}
