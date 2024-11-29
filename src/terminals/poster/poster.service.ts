import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { PosterCloseOrderPayload } from './dto';

@Injectable()
export class PosterService {
  private readonly api: AxiosInstance;
  private readonly posterBaseUrl = 'https://joinposter.com/api';
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('POSTER_API_TOKEN');

    if (!this.token) {
      throw new Error(
        'POSTER_API_TOKEN is not defined in the environment variables',
      );
    }

    this.api = axios.create({
      baseURL: this.posterBaseUrl,
      timeout: 5000, // 5 seconds timeout
    });
  }

  async closeOrder(
    posterCloseOrderPayload: PosterCloseOrderPayload,
  ): Promise<{ err_code: number }> {
    try {
      const response = await this.api({
        method: 'post',
        url: `/transactions.closeTransaction?token=${this.token}`,
        data: {
          spot_id: posterCloseOrderPayload.spotId,
          spot_tablet_id: posterCloseOrderPayload.spotTabletId,
          transaction_id: posterCloseOrderPayload.orderId,
          payed_cash: posterCloseOrderPayload.total,
        },
      });
      console.log('axiosResponse: ', response);

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

  validateCloseOrderPayload(payload: PosterCloseOrderPayload) {
    if (
      !payload.spotId ||
      !payload.spotTabletId ||
      !payload.orderId ||
      !payload.total
    ) {
      throw new Error('Invalid close order payload');
    }
    return true;
  }
}
