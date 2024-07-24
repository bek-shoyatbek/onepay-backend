import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('memCache')
  getMemCache() {
    return this.appService.getMemCache();
  }

  @Post('pushMemCache')
  pushMemCache(@Body() data: any) {
    this.logger.log(data);
    return this.appService.pushMemCache(data);
  }
}
