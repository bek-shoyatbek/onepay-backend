import { Module } from '@nestjs/common';
import { UzumService } from './uzum.service';
import { UzumController } from './uzum.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UzumController],
  providers: [UzumService, PrismaService],
})
export class UzumModule {}
