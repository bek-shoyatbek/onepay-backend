import { Module } from '@nestjs/common';
import { PosterService } from './poster.service';
import { PosterController } from './poster.controller';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PosterController],
  providers: [PosterService, ConfigService, PrismaService],
})
export class PosterModule { }
