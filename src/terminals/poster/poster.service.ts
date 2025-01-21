import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CloseTransactionDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Transaction } from './interfaces';

@Injectable()
export class PosterService {
  private readonly api: AxiosInstance;
  private readonly posterBaseUrl = 'https://joinposter.com/api';
  private readonly token: string;
  private readonly logger = new Logger(PosterService.name);


  constructor(private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {
    this.token = this.configService.get<string>('POSTER_API_TOKEN');

    if (!this.token) {
      throw new InternalServerErrorException(
        'POSTER_API_TOKEN is not defined in the environment variables',
      );
    }

    this.api = axios.create({
      baseURL: this.posterBaseUrl,
      timeout: 5000,
    });
  }

  async closeTransaction(
    closeTransactionDto: CloseTransactionDto,
  ): Promise<{ err_code: number }> {
    const restaurant = await this.prismaService.restaurant.findFirstOrThrow({
      where: {
        title: closeTransactionDto.accountUrl,
      }
    });

    if (!restaurant) {
      throw new HttpException('Restaurant not found', 404);
    }

    if (!restaurant.personalToken) {
      throw new InternalServerErrorException('Personal token not found');
    }

    this.logger.log(`Personal token: ${restaurant.personalToken}`);
    this.logger.log(`closeTransaction: ${closeTransactionDto}`);
    const transaction = await this.getTransactionByOrderId(
      restaurant.personalToken,
      closeTransactionDto.orderId)

    if (!transaction) {
      throw new HttpException('TransactionSchema not found', 404);
    }

    const payload = {
      spot_id: transaction.spot_id,
      spot_tablet_id: +closeTransactionDto.spotTabletId,
      transaction_id: +transaction.transaction_id,
      payed_cash: +transaction.sum / 100,
    };

    try {
      const response = await this.api.post(
        `/transactions.closeTransaction?token=${restaurant.personalToken}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`closeTransaction response: ${response.data}`);
      return response.data.response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `Failed to close transaction: ${error.message}`,
          error.response?.status || 500,
        );
      }
      throw error;
    }
  }

  private async getTransactionByOrderId(resToken: string, orderId: string) {
    try {
      const response = await this.api<{ response: Transaction[] }>({
        method: 'get',
        url: `/dash.getTransaction?token=${resToken}&transaction_id=${orderId}`,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      this.logger.log(`getTransactionByOrderId response: ${response.data}`);
      const transactions = response.data.response;
      return transactions?.length > 0 ? transactions[0] : null;
    } catch (error) {
      console.error('Error getting transaction by order ID:', error);
    }
  }
}
