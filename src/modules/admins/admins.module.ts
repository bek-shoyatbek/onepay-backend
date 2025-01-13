import { Module } from "@nestjs/common";
import { AdminsController } from "./admins.controller";
import { AdminsService } from "./admins.service";
import { RestaurantsModule } from "../restaurants/restaurants.module";
import { ConfigService } from "@nestjs/config";
import { WaitersModule } from "../waiters/waiters.module";
import { AuthModule } from "src/shared/auth/auth.module";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [RestaurantsModule, WaitersModule, AuthModule],
    controllers: [AdminsController],
    providers: [AdminsService, ConfigService, JwtService],
})
export class AdminsModule { }