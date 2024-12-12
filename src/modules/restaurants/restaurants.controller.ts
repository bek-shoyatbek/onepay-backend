import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RestaurantsService } from './restaurants.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) { }

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
  @UseInterceptors(FileInterceptor('image'))
  async updateRestaurant(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 24 * 10_000 }),
          new FileTypeValidator({ fileType: 'image/*' })
        ],
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File | null,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.updateRestaurant(id, {
      ...updateRestaurantDto,
      image: image ? image.filename : undefined
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRestaurant(@Param('id') id: string) {
    await this.restaurantsService.deleteRestaurant(id);
    return null;
  }
}