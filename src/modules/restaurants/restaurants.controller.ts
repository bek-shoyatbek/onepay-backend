import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { AuthGuard } from 'src/shared/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) { }

  @Post('')
  async createRestaurant(@Body() body: CreateRestaurantDto) {
    return await this.restaurantsService.createRestaurant(body)
  }

  @Get('')
  async getRestaurants(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ) {
    const skip = (page - 1) * limit;

    return await this.restaurantsService.getRestaurants({
      skip,
      take: limit,
      where: search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined,
      orderBy: { createdAt: 'desc' }

    });

  }


  @Get(':id')
  async getRestaurantById(@Param('id') id: string) {
    return await this.restaurantsService.getRestaurantById(id);
  }

  @Put(':id')
  async updateRestaurant(
    @Param('id') id: string,
    @Body() updateRestaurantDto: Partial<CreateRestaurantDto>,
  ) {
    return await this.restaurantsService.updateRestaurant(id, updateRestaurantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRestaurant(@Param('id') id: string) {
    return await this.restaurantsService.deleteRestaurant(id);

  }
}