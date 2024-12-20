import { Transaction } from '@prisma/client';
import { CompleteOrderParams } from '../../terminals/rkeeper/types/complete-order.params';
import { InternalServerErrorException } from '@nestjs/common';
import { RkeeperService } from '../../terminals/rkeeper/rkeeper.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PosterService } from '../../terminals/poster/poster.service';
import { CloseTransactionDto } from '../../terminals/poster/dto';

export const closeOrder = async (
  terminal: string,
  transaction: Transaction,
) => {
  switch (terminal) {
    case 'poster': {
      const posterService = new PosterService(new ConfigService());
      const payload: CloseTransactionDto = {
        spotId: transaction.spotId,
        tableId: transaction.tableId,
        total: transaction.amount + '',
        userId: transaction.userId,
      };

      const response = await posterService.closeTransaction(payload);
      if (response?.err_code !== 0) {
        throw new InternalServerErrorException("Couldn't close order");
      }
      return true;
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

      const isOrderCompleted = await rkeeperService.closeOrder(rKeeperParams);

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
