import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { GrammyCoreModule } from '@grammyjs/nestjs';
import { MemorySessionStorage, session } from 'grammy';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    GrammyCoreModule.forRoot({
      token: process.env.BOT_TOKEN,
      middlewares: [
        session({
          initial: () => ({ registrationStep: 0 }),
          storage: new MemorySessionStorage(),
        }),
      ],
    }),
  ],
  controllers: [BotController],
  providers: [BotService, PrismaService],
})
export class BotModule {}
