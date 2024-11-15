import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpExceptionFilter } from './http/http.filter';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
import morgan from 'morgan';
import InternalServerErrorExceptionFilter from './http/internal-server-error.filter';

const PORT = process.env.PORT || 6500;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontendAssetsDir = join(__dirname, '..', 'frontend');

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.use(morgan('dev'));

  app.enableCors();

  app.useStaticAssets(frontendAssetsDir);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new InternalServerErrorExceptionFilter());

  app.setGlobalPrefix('api/v1');

  await app.listen(PORT);

  console.log("Application running on port: ", PORT);
}
bootstrap();
