import { Module } from '@nestjs/common';
import { PosterService } from './poster.service';
import { PosterController } from './poster.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [PosterController],
  providers: [PosterService, ConfigService],
})
export class PosterModule {}
