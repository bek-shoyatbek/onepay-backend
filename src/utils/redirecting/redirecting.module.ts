import { Module } from '@nestjs/common';
import { HashingService } from '../hashing/hashing.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [],
  providers: [HashingService],
})
export class RedirectingModule {}
