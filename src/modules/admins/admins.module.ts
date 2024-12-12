import { Module } from "@nestjs/common";
import { AdminsController } from "./admins.controller";
import { AdminsService } from "./admins.service";
import { RestaurantsModule } from "../restaurants/restaurants.module";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [RestaurantsModule],
    controllers: [AdminsController],
    providers: [AdminsService, ConfigService],
})
export class AdminsModule { }