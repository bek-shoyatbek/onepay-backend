import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RkeeperController } from './rkeeper.controller';
import { RkeeperService } from './rkeeper.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [RkeeperController],
  providers: [RkeeperService],
})
export class RkeeperModule {}
