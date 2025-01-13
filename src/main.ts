import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpExceptionFilter } from './shared/filters/http.filter';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
import morgan from 'morgan';
import InternalServerErrorExceptionFilter from './shared/filters/internal-server-error.filter';
import { ValidationPipe } from '@nestjs/common';

const PORT = process.env.PORT || 6500;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontendAssetsDir = join(__dirname, '..', 'frontend');

  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.setViewEngine('ejs');

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.use(morgan('dev'));


  app.enableCors();

  app.useStaticAssets(frontendAssetsDir);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new InternalServerErrorExceptionFilter());

  app.setGlobalPrefix('api/v1');

  await app.listen(PORT);
}
bootstrap()
  .then(() => {
    console.log('Application started on port ' + PORT);
  })
  .catch((error) => {
    console.log('Application failed to start');
    console.log(error);
  });
