import { Module } from '@nestjs/common';
import { PaymeService } from './payme.service';
import { PaymeController } from './payme.controller';
import { PrismaService } from 'src/prisma.service';
import { PaymeBasicAuthGuard } from 'src/auth/guards/payme.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PaymeController],
  providers: [PaymeService, PrismaService, PaymeBasicAuthGuard],
})
export class PaymeModule {}
