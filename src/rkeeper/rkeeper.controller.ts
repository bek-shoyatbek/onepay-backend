import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RkeeperService } from './rkeeper.service';

@Controller('rkeeper')
export class RkeeperController {
  constructor(private readonly rkeeperService: RkeeperService) {}

  @Get('/orders/:orderId')
  async getOrderWaiterIdAndStationId(@Param('orderId') orderId: string) {
    return await this.rkeeperService.getOrderWaiterIdAndStationId(orderId);
  }

  @Post('/orders/:orderId/complete')
  async completeOrder(
    @Param('orderId') orderId: string,
    @Body() amount: number,
  ) {
    return await this.rkeeperService.completeOrder(orderId, amount);
  }
}
