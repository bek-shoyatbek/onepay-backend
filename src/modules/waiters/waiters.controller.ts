
import {
    Body, Controller, Delete, Get,
    HttpCode, HttpStatus, Param, Post, Put, Query,
    UseGuards,
} from '@nestjs/common'; import { WaitersService } from './waiters.service';
import { CreateWaiterDto } from './dto/create-waiter.dto';
import { AuthGuard } from 'src/shared/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('waiters')
export class WaitersController {
    constructor(private readonly waitersService: WaitersService) { }
    @Post('')
    async createWaiter(@Body() body: CreateWaiterDto) {
        return await this.waitersService.createWaiter(body)
    }

    @Get('')
    async getWaiters(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
        const skip = (page - 1) * limit; return await this.waitersService.getWaiters({ skip, take: limit, where: search ? { OR: [{ fullname: { contains: search, mode: 'insensitive' } }, { image: { contains: search, mode: 'insensitive' } }] } : undefined, orderBy: { createdAt: 'desc' } });
    }

    @Get(':id')
    async getWaiterById(@Param('id') id: string) {
        return await this.waitersService.getWaiterById(id);
    }

    @Put(':id')
    async updateWaiter(@Param('id') id: string, @Body() updateWaiterDto: Partial<CreateWaiterDto>,) {
        return this.waitersService.updateWaiter(id, updateWaiterDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteWaiter(@Param('id') id: string) {
        return await this.waitersService.deleteWaiter(id);
    }
}
