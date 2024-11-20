import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UzumModule } from './payment-services/uzum/uzum.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ClickModule } from './payment-services/click/click.module';
import { PaymeModule } from './payment-services/payme/payme.module';
import { PaymentServicesModule } from './payment-services/payment-services.module';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './configs/logger.config';
import { RedirectingModule } from './utils/redirecting/redirecting.module';
import { RkeeperService } from './rkeeper/rkeeper.service';
import { RkeeperModule } from './rkeeper/rkeeper.module';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { BotModule } from './bot/bot.module';
import { APP_FILTER } from '@nestjs/core';
import { PosterModule } from './poster/poster.module';
import InternalServerErrorExceptionFilter from './http/internal-server-error.filter';

const frontendAssetsDir = join(process.cwd(), 'frontend');
@Module({
  imports: [
    UzumModule,
    ClickModule,
    PaymeModule,
    AuthModule,
    ConfigModule.forRoot(),
    PaymentServicesModule,
    WinstonModule.forRoot(loggerConfig),
    RedirectingModule,
    RkeeperModule,
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: frontendAssetsDir,
    }),
    // BotModule,
    PosterModule,
  ],
  controllers: [AppController],
  providers: [AppService, RkeeperService,
    {
      provide: APP_FILTER,
      useClass: InternalServerErrorExceptionFilter
    }
  ],
})


export class AppModule { }
