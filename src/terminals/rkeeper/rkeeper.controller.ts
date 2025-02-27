import { Controller, Get, Param, Query } from '@nestjs/common';
import { RkeeperService } from './rkeeper.service';
import { RKeeperParams } from 'src/types/rkeeper-params';

@Controller('rkeeper')
export class RkeeperController {
  constructor(private readonly rkeeperService: RkeeperService) { }

  @Get('/orders/:orderId')
  async getOrderWaiterIdAndStationId(@Param('orderId') orderId: string) {
    return await this.rkeeperService.getOrderWaiterIdAndStationId(orderId);
  }

  @Get('/generate-url')
  async generateURL(@Query() params: RKeeperParams) {
    return await this.rkeeperService.generateURL(params);
  }
}
