import { Controller, Get, Param, Render, UseGuards } from "@nestjs/common";
import { RestaurantsService } from "../restaurants/restaurants.service";
import { WaitersService } from "../waiters/waiters.service";
import { AuthGuard } from "src/shared/auth/auth.guard";

@Controller('admins')
export class AdminsController {
    constructor(private readonly restaurantService: RestaurantsService, private readonly waitersService: WaitersService) { }


    @Get('login')
    @Render('admin/auth/login')
    getLogin() {
        return {}
    }

    @UseGuards(AuthGuard)
    @Get('restaurants')
    @Render('admin/restaurants/index')
    async getRestaurants() {
        const result = await this.restaurantService.getRestaurants();
        return result;
    }


    @UseGuards(AuthGuard)
    @Get('restaurants/create')
    @Render('admin/restaurants/create')
    getCreateRestaurants() {
        return {}
    }


    @UseGuards(AuthGuard)
    @Get('restaurants/:id/edit')
    @Render('admin/restaurants/edit')
    async getEditRestaurants(@Param('id') id: string) {
        const restaurant = await this.restaurantService.getRestaurantById(id);
        return {
            restaurant
        }
    }

    @UseGuards(AuthGuard)
    @Get('waiters')
    @Render('admin/waiters/index')
    async getWaiters() {
        return await this.waitersService.getWaiters();
    }

    @UseGuards(AuthGuard)
    @Get('waiters/create')
    @Render('admin/waiters/create')
    async getCreateWaiters() {
        return await this.restaurantService.getRestaurants();
    }

    @UseGuards(AuthGuard)
    @Get('waiters/:id/edit')
    @Render('admin/waiters/edit')
    async getEditWaiters(@Param('id') id: string) {
        const waiter = await this.waitersService.getWaiterById(id);
        const result = await this.restaurantService.getRestaurants();
        return {
            waiter,
            restaurants: result.restaurants
        }
    }


}
