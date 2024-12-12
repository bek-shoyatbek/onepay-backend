import {
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prismaService: PrismaService) { }

  async createRestaurant(restaurant: CreateRestaurantDto & { image?: string }) {
    try {
      return await this.prismaService.restaurant.create({
        data: {
          title: restaurant.title,
          location: restaurant.location,
          image: restaurant.image || ''
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A restaurant with this title already exists');
        }
      }
      throw error;
    }
  }

  async getRestaurants(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RestaurantWhereUniqueInput;
    where?: Prisma.RestaurantWhereInput;
    orderBy?: Prisma.RestaurantOrderByWithRelationInput;
  } = {}) {
    const {
      skip,
      take = 10,
      cursor,
      where,
      orderBy
    } = params;

    const [restaurants, total] = await Promise.all([
      this.prismaService.restaurant.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          _count: {
            select: {
              waiters: true,
              admins: true,
              tips: true
            }
          }
        }
      }),
      this.prismaService.restaurant.count({ where })
    ]);

    return {
      restaurants,
      pagination: {
        totalRestaurants: total,
        currentPage: skip / take + 1,
        totalPages: Math.ceil(total / take),
      }
    }
  }

  async getRestaurantById(id: string) {
    const restaurant = await this.prismaService.restaurant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            waiters: true,
            admins: true,
            tips: true
          }
        }
      }
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async updateRestaurant(id: string, data: UpdateRestaurantDto) {
    try {
      return await this.prismaService.restaurant.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.location && { location: data.location }),
          ...(data.image && { image: data.image })
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Restaurant with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async deleteRestaurant(id: string) {
    try {
      return await this.prismaService.restaurant.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Restaurant with ID ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException('Cannot delete restaurant with associated records');
        }
      }
      throw error;
    }
  }

  // Additional utility methods
  async restaurantExists(id: string): Promise<boolean> {
    const restaurant = await this.prismaService.restaurant.findUnique({
      where: { id }
    });
    return !!restaurant;
  }
}