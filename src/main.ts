import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import * as morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpExceptionFilter } from './http/http.filter';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';

const PORT = process.env.PORT || 6500;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'frontend'));

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api/v1');

  app.use(morgan('dev'));

  await app.listen(PORT);
}
bootstrap();
