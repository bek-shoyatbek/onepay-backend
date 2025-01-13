import { Module } from "@nestjs/common";
import { WaitersService } from "./waiters.service";
import { PrismaService } from "src/prisma/prisma.service";
import { WaitersController } from "./waiters.controller";
import { AuthModule } from "src/shared/auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [AuthModule, ConfigModule],
    controllers: [WaitersController],
    providers: [WaitersService, PrismaService, JwtService],
    exports: [WaitersService]
})
export class WaitersModule { }