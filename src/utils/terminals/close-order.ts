import { Transaction } from '@prisma/client';
import { CompleteOrderParams } from '../../terminals/rkeeper/types/complete-order.params';
import { InternalServerErrorException } from '@nestjs/common';
import { RkeeperService } from '../../terminals/rkeeper/rkeeper.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PosterService } from '../../terminals/poster/poster.service';
import { CloseTransactionDto } from '../../terminals/poster/dto';
import { PrismaService } from 'src/prisma/prisma.service';

export const closeOrder = async (
  terminal: string,
  transaction: Transaction,
) => {
  switch (terminal) {
    case 'poster': {
      try {

        const posterService = new PosterService(new ConfigService(), new PrismaService());

        const payload: CloseTransactionDto = {
          spotId: transaction.spotId,
          tableId: transaction.tableId,
          total: transaction.amount + '',
          userId: transaction.userId,
          spotTabletId: transaction.spotTabletId,
          accountUrl: transaction.accountUrl,
          orderId: transaction.orderId
        };
        console.log("payload: ", payload);

        const response = await posterService.closeTransaction(payload);
        if (response?.err_code !== 0) {
          throw new InternalServerErrorException("Couldn't close order");
        }
        return true;
      } catch (err) {
        console.error(err);
        throw new InternalServerErrorException("Couldn't close order");
      }
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
