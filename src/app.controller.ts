import { Controller, Get, Logger, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getPaymentPage(@Res() res: Response) {
    const pathToIndexHTML = join(process.cwd(), 'build-ui', 'index.html');
    console.log(pathToIndexHTML);
    return res.sendFile(join(process.cwd(), 'build-ui', 'index.html'));
  }
}
