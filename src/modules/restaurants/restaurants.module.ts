import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from 'src/shared/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [forwardRef(() => AuthModule), PrismaModule, MulterModule.register({
    dest: './uploads',
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      cb(null, allowedTypes.includes(file.mimetype));
    }
  })],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, JwtService, ConfigService],
  exports: [RestaurantsService]
})
export class RestaurantsModule { }
