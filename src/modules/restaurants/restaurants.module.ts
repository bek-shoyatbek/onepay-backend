import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [PrismaModule, MulterModule.register({
    dest: './uploads',
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      cb(null, allowedTypes.includes(file.mimetype));
    }
  })],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService]
})
export class RestaurantsModule { }
