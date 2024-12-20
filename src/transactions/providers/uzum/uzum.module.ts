import { Module } from '@nestjs/common';
import { UzumService } from './uzum.service';
import { UzumController } from './uzum.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/shared/auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [UzumController],
  providers: [UzumService, PrismaService],
})
export class UzumModule {}
