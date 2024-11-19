import { All, Body, Controller, HttpCode } from '@nestjs/common';
import { PosterService } from './poster.service';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) { }

  @All()
  @HttpCode(200)
  getPoster(@Body() body) {
    console.log(body);
  }

}
