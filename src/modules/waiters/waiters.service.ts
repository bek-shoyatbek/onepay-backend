import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateWaiterDto } from "./dto/create-waiter.dto";
import { Prisma } from "@prisma/client";


@Injectable()
export class WaitersService {
    constructor(private readonly prismaService: PrismaService) {

    }

    async createWaiter(createWaiterDto: CreateWaiterDto) {

        const restaurant = await this.prismaService.restaurant.findFirst({
            where: {
                id: createWaiterDto.spotId
            }
        })

        if (!restaurant) {
            throw new BadRequestException('Restaurant not found')
        }
        return await this.prismaService.waiter.create({
            data: {
                fullname: createWaiterDto.fullname,
                image: createWaiterDto.image,
                restaurant: {
                    connect: {
                        id: restaurant.id
                    }
                }
            },

        })

    }

    async getWaiters(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.WaiterWhereUniqueInput;
        where?: Prisma.WaiterWhereInput;
        orderBy?: Prisma.WaiterOrderByWithRelationInput;
    } = {}) {
        const { skip, take = 10, cursor, where, orderBy } = params;

        const [waiters, total] = await Promise.all([
            this.prismaService.waiter.findMany({
                skip,
                take,
                cursor,
                where,
                orderBy,
                include: {
                    restaurant: true,
                },
            }),
            this.prismaService.waiter.count({ where }),
        ]);

        return {
            waiters,
            pagination: {
                totalWaiters: total,
                currentPage: skip / take + 1,
                totalPages: Math.ceil(total / take),
            },
        };
    }

    async getWaiterById(id: string) {
        const waiter = await this.prismaService.waiter.findUnique({
            where: { id },
            include: {
                restaurant: true,
            },
        });

        if (!waiter) {
            throw new NotFoundException(`Waiter with ID ${id} not found`);
        }

        return waiter;
    }

    async updateWaiter(id: string, data: Partial<CreateWaiterDto>) {
        const waiter = await this.prismaService.waiter.findUnique({
            where: { id },
            include: {
                restaurant: true,
            },
        });

        if (!waiter) {
            throw new NotFoundException(`Waiter with ID ${id} not found`);
        }

        const restaurant = await this.prismaService.restaurant.findFirst({
            where: {
                id: data.spotId,
            },
        });

        if (!restaurant) {
            throw new BadRequestException('Restaurant not found');
        }

        return await this.prismaService.waiter.update({
            where: { id },
            data: {
                fullname: data.fullname || waiter.fullname,
                image: data.image || waiter.image,
                restaurantId: restaurant.id || waiter.restaurantId,
                userId: data.userId || waiter.userId
            },
        });
    }

    async deleteWaiter(id: string) {
        try {
            return await this.prismaService.waiter.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`Waiter with ID ${id} not found`);
                }
                if (error.code === 'P2003') {
                    throw new ConflictException('Cannot delete waiter with associated records');
                }
            }
            throw error;
        }
    }


}