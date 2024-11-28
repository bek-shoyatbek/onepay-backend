import { Module } from '@nestjs/common';
import { PaymeService } from './payme.service';
import { PaymeController } from './payme.controller';
import { PrismaService } from 'src/prisma.service';
import { PaymeBasicAuthGuard } from 'src/auth/guards/payme.guard';
import { ConfigModule } from '@nestjs/config';
import { RkeeperModule } from 'src/rkeeper/rkeeper.module';
import { RkeeperService } from 'src/rkeeper/rkeeper.service';
import { HttpModule } from '@nestjs/axios';
import { PosterService } from 'src/poster/poster.service';

@Module({
  imports: [ConfigModule, RkeeperModule, HttpModule],
  controllers: [PaymeController],
  providers: [
    PaymeService,
    PrismaService,
    PaymeBasicAuthGuard,
    RkeeperService,
    PosterService,
  ],
})
export class PaymeModule {}
