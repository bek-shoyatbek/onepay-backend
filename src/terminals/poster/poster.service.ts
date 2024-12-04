import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CloseTransactionDto } from './dto';
import { Transaction } from './interfaces';

@Injectable()
export class PosterService {
  private readonly api: AxiosInstance;
  private readonly posterBaseUrl = 'https://joinposter.com/api';
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
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

  async closeTransaction(
    closeTransactionDto: CloseTransactionDto,
  ): Promise<{ err_code: number }> {
    const transaction = await this.getTransaction(closeTransactionDto);

    if (!transaction) {
      throw new HttpException('Transaction not found', 404);
    }

    const payload = {
      spot_id: +transaction.spot_id,
      spot_tablet_id: '1', // TODO: add tablet id
      transaction_id: +transaction.transaction_id,
      payed_cash: +transaction.sum / 100,
    };

    try {
      const response = await this.api.post(
        `/transactions.closeTransaction?token=${this.token}`,
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
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Transaction[]> {
    try {
      const response = await this.api({
        method: 'get',
        url: `/dash.getTransactions?token=${this.token}&dateFrom=${dateFrom}&dateTo=${dateTo}`,
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

  private async getTodayTransactions() {
    const todayYYYYMMDD = new Date().toISOString().split('T')[0];
    return await this.getTransactions(todayYYYYMMDD, todayYYYYMMDD);
  }

  private async getTransaction(details: CloseTransactionDto) {
    const todayTransactions = await this.getTodayTransactions();

    return todayTransactions.find((transaction) => {
      return (
        transaction.spot_id === details.spotId &&
        transaction.table_id === details.tableId &&
        transaction.sum === details.total &&
        transaction.user_id === details.userId
      );
    });
  }
}
