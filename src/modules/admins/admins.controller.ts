import { Body, Controller, Delete, Get, Param, Post, Put, Query, Render, Res, ValidationPipe } from "@nestjs/common";
import { RestaurantsService } from "../restaurants/restaurants.service";
import { CreateRestaurantDto } from "../restaurants/dto/create-restaurant.dto";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

@Controller('admins')
export class AdminsController {
    private readonly username: string;
    private readonly password: string;
    constructor(private readonly restaurantService: RestaurantsService, private readonly configService: ConfigService) {
        this.username = this.configService.get<string>('ADMIN_USERNAME');
        this.password = this.configService.get<string>('ADMIN_PASSWORD');
    }

    @Get('restaurants')
    @Render('admin/restaurants/index')
    async getRestaurants() {
        return await this.restaurantService.getRestaurants();
    }

    @Get('restaurants/create')
    @Render('admin/restaurants/create')
    getCreateRestaurants() {
        return {}
    }

    @Post('restaurants')
    async createRestaurant(@Body() body: CreateRestaurantDto) {
        console.log(body);

        return await this.restaurantService.createRestaurant(body)
    }

    @Get('restaurants/:id/edit')
    @Render('admin/restaurants/edit')
    async getEditRestaurants(@Param('id') id: string) {
        const restaurant = await this.restaurantService.getRestaurantById(id);
        return {
            restaurant
        }
    }


    @Delete('restaurants/:id')
    async deleteRestaurant(@Param('id') id: string) {
        return await this.restaurantService.deleteRestaurant(id)
    }

    @Put('restaurants/:id')
    async updateRestaurant(@Param('id') id: string, @Body() body: Partial<CreateRestaurantDto>) {
        return await this.restaurantService.updateRestaurant(id, body)
    }

}