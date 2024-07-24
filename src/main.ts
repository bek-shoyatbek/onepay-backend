import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import * as morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

const PORT = process.env.PORT || 6500;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableCors();

  app.setGlobalPrefix('api/v1');

  app.use(morgan('dev'));

  await app.listen(PORT);
}
bootstrap();
