import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UzumModule } from './transactions/providers/uzum/uzum.module';
import { AuthModule } from './shared/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ClickModule } from './transactions/providers/click/click.module';
import { PaymeModule } from './transactions/providers/payme/payme.module';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './shared/configs/logger.config';
import { RedirectingModule } from './utils/redirecting/redirecting.module';
import { RkeeperService } from './terminals/rkeeper/rkeeper.service';
import { RkeeperModule } from './terminals/rkeeper/rkeeper.module';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { APP_FILTER } from '@nestjs/core';
import { PosterModule } from './terminals/poster/poster.module';
import InternalServerErrorExceptionFilter from './shared/filters/internal-server-error.filter';
import { TransactionsModule } from './transactions/transactions.module';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { HttpLoggerMiddleware } from './shared/middlewares/http-logger.middleware';
import { MulterModule } from '@nestjs/platform-express';
import { AdminsModule } from './modules/admins/admins.module';

const frontendAssetsDir = join(process.cwd(), 'frontend');
@Module({
  imports: [
    UzumModule,
    ClickModule,
    PaymeModule,
    AuthModule,
    ConfigModule.forRoot(),
    TransactionsModule,
    WinstonModule.forRoot(loggerConfig),
    RedirectingModule,
    RkeeperModule,
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: frontendAssetsDir,
    }),
    PosterModule,
    PrismaModule,
    RestaurantsModule,
    AdminsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RkeeperService,
    {
      provide: APP_FILTER,
      useClass: InternalServerErrorExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
