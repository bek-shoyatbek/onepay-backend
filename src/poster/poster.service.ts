import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { TransactionData, TransactionPayloadDto, TransactionsResponse } from './dto';



@Injectable()
export class PosterService {
    private readonly axiosInstance: AxiosInstance;
    private readonly baseUrl = 'https://joinposter.com/api';
    private readonly token: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        // Get token from environment variables using ConfigService
        this.token = this.configService.get<string>('POSTER_API_TOKEN');

        if (!this.token) {
            throw new Error('POSTER_API_TOKEN is not defined in the environment variables');
        }

        // Create axios instance with default config
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: 5000, // 5 seconds timeout
        });
    }

    async getTransactions(dateFrom?: string, dateTo?: string): Promise<TransactionData[]> {
        try {
            const today = new Date().toISOString().split('T')[0];

            if (!dateFrom) {
                dateFrom = today;
            }


            if (!dateTo) {
                dateTo = today;
            }


            const response = await this.axiosInstance({
                method: 'get',
                url: `/transactions.getTransactions?token=${this.token}&date_from=${dateFrom}&date_to=${dateTo}`,
            });
            const data = response.data as TransactionsResponse;

            return data.response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new HttpException(
                    `Failed to get today transactions: ${error.message}`,
                    error.response?.status || 500
                );
            }
            throw error;
        }
    }

    /**
     * Closes a transaction in the Poster system
     * @param transaction Transaction details to be closed
     * @returns Promise with the API response
     * @throws HttpException if the API request fails
     */
    async closeTransaction(transaction: TransactionPayloadDto): Promise<{ response: { err_code: number } }> {
        try {
            const response = await this.axiosInstance({
                method: 'post',
                url: `/transactions.closeTransaction?token=${this.token}`,
                data: {
                    spot_id: transaction.spotId,
                    spot_tablet_id: transaction.spotTabletId,
                    transaction_id: transaction.transactionId,
                    payed_cash: transaction.total
                },
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new HttpException(
                    `Failed to close transaction: ${error.message}`,
                    error.response?.status || 500
                );
            }
            throw error;
        }
    }


}