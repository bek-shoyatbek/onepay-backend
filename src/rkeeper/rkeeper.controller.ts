import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RkeeperService } from './rkeeper.service';
import { CompleteOrderParams } from './types/complete-order.params';

@Controller('rkeeper')
export class RkeeperController {
  constructor(private readonly rkeeperService: RkeeperService) {}

  @Get('/orders/:orderId')
  async getOrderWaiterIdAndStationId(@Param('orderId') orderId: string) {
    return await this.rkeeperService.getOrderWaiterIdAndStationId(orderId);
  }

  @Post('/orders/complete')
  async completeOrder(@Body() completeOrderDto: CompleteOrderParams) {
    return await this.rkeeperService.completeOrder(completeOrderDto);
  }
}
