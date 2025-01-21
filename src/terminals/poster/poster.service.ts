import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CloseTransactionDto } from './dto';
import { Transaction } from './interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PosterService {
  private readonly api: AxiosInstance;
  private readonly posterBaseUrl = 'https://joinposter.com/api';
  private readonly token: string;


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
      timeout: 5000, // 5 seconds timeout
    });
  }

  private async getCashRegisters(resToken: string) {
    try {
      const response = await this.api({
        method: 'get',
        url: '/access.getTablets?token=' + resToken,
      });

      return response.data.response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `Failed to get cash registers: ${error.message}`,
          error.response?.status || 500,
        );
      }
      throw error;
    }
  }

  async closeTransaction(
    closeTransactionDto: CloseTransactionDto,
  ): Promise<{ err_code: number }> {
    const restaurant = await this.prismaService.restaurant.findFirst({
      where: {
        accountUrl: closeTransactionDto.accountUrl,
      }
    });

    if (!restaurant) {
      throw new HttpException('Restaurant not found', 404);
    }

    if (!restaurant.personalToken) {
      throw new InternalServerErrorException('Personal token not found');
    }

    const transaction = await this.getTransaction(restaurant.personalToken, closeTransactionDto);

    if (!transaction) {
      throw new HttpException('TransactionSchema not found', 404);
    }

    const payload = {
      spot_id: +transaction.spot_id,
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
      console.log('axiosResponse: ', response.data);
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

  async getTransactions(
    resToken: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Transaction[]> {
    console.log("dateFrom: " + dateFrom);
    console.log("dateTo: " + dateTo);
    try {
      const response = await this.api({
        method: 'get',
        url: `/dash.getTransactions?token=${resToken}&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `Failed to get transactions: ${error.message}`,
          error.response?.status || 500,
        );
      }
      throw error;
    }
  }

  private async getTodayTransactions(resToken: string) {
    const todayYYYYMMDD = new Date().toISOString().split('T')[0];
    return await this.getTransactions(resToken, todayYYYYMMDD, todayYYYYMMDD);
  }

  private async getTransaction(resToken: string, details: CloseTransactionDto) {
    console.log("resToken: " + resToken);
    console.table(details);
    const todayTransactions = await this.getTodayTransactions(resToken);

    console.log('todayTransactions: ', todayTransactions);
    return todayTransactions?.find((transaction) => {
      return (
        transaction.spot_id === details.spotId &&
        transaction.table_id === details.tableId &&
        transaction.sum === details.total &&
        transaction.user_id === details.userId
      );
    });
  }
}
