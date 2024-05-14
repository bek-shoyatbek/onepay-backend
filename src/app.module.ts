import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UzumModule } from './payment-services/uzum/uzum.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ClickModule } from './payment-services/click/click.module';
import { PaymeModule } from './payment-services/payme/payme.module';
import { PaymentServicesModule } from './payment-services/payment-services.module';

@Module({
  imports: [
    UzumModule,
    ClickModule,
    PaymeModule,
    AuthModule,
    ConfigModule.forRoot(),
    PaymentServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
