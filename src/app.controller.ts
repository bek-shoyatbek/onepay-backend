import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {

  constructor(private readonly appService: AppService) { }

  @Get()
  getPaymentPage(@Res() res: Response) {
    const pathToIndexHTML = join(process.cwd(), 'frontend', 'index.html');
    console.log(pathToIndexHTML);
    return res.sendFile(join(process.cwd(), 'frontend', 'index.html'));
  }
}
