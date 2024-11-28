import { Transaction } from '@prisma/client';
import { CompleteOrderParams } from '../../rkeeper/types/complete-order.params';
import { InternalServerErrorException } from '@nestjs/common';
import { RkeeperService } from '../../rkeeper/rkeeper.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

export const closeOrder = async (
  terminal: string,
  transaction: Transaction,
) => {
  switch (terminal) {
    case 'poster': {
      // TODO
      throw new Error('Not implemented');
    }
    case 'rkeeper': {
      const rkeeperService = new RkeeperService(
        new ConfigService(),
        new HttpService(),
      );
      const rKeeperParams: CompleteOrderParams = {
        orderId: transaction.orderId,
        total: transaction.amount,
        userId: transaction.userId,
        spotId: transaction.spotId,
      };

      const isOrderCompleted =
        await rkeeperService.completeOrder(rKeeperParams);

      if (!isOrderCompleted) {
        throw new InternalServerErrorException('Order completion failed');
      }
      break;
    }
    case 'iiko': {
      // TODO
      throw new Error('Not implemented');
    }
  }
};
