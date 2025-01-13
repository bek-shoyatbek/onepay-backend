import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './auth-basic.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';



@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          global: true,
          signOptions: { expiresIn: '2h' },
          secret: configService.get<string>('JWT_SECRET'),
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [BasicStrategy, AuthService, AuthGuard],
})
export class AuthModule { }

