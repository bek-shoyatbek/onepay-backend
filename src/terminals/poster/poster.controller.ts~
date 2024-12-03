import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PosterService } from './poster.service';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}

  @Post()
  @HttpCode(200)
  getPoster(@Body() body: any) {
    console.log(body);
  }
}
