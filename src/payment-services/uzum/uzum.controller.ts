import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UzumService } from './uzum.service';
import { RequestDto } from './dto/Request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('uzum')
export class UzumController {
  constructor(private readonly uzumService: UzumService) {}

  @UseGuards(AuthGuard('basic'))
  @Post('check')
  async check(@Body() reqBody: RequestDto) {
    return await this.uzumService.check(reqBody);
  }

  @Post('create')
  async create(@Body() reqBody: RequestDto) {
    return await this.uzumService.create(reqBody);
  }

  @Post('confirm')
  async confirm(@Body() reqBody: RequestDto) {
    return await this.uzumService.confirm(reqBody);
  }

  @Post('reverse')
  async reverse(@Body() reqBody: RequestDto) {
    return await this.uzumService.reverse(reqBody);
  }
  @Post('status')
  async status(@Body() reqBody: RequestDto) {
    return await this.uzumService.status(reqBody);
  }
}
