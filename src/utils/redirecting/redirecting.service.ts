import { Injectable } from '@nestjs/common';
import { PaymentParams } from 'src/types/payment-params';
import { PaymentProvider } from 'src/types/payment-providers';
import { HashingService } from '../hashing/hashing.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedirectingService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
  ) {}
  public generateRedirectUrl(
    provider: PaymentProvider,
    params: PaymentParams,
  ): string {
    switch (provider) {
      case 'payme':
        return this.generateRedirectUrlForPayme(params);
      case 'uzum':
        return this.generateRedirectUrlForUzum(params);
      case 'click':
        return this.generateRedirectUrlForClick(params);
      default:
        throw new Error('Provider not found');
    }
  }

  private generateRedirectUrlForPayme(params: PaymentParams) {
    const BASE_URL = 'https://checkout.paycom.uz';
    const merchantId = this.configService.get<string>('PAYME_MERCHANT_ID');
    const strToBeHashed = `m=${merchantId};ac.transactionId=${params.transactionId};a=${params.amount};`;
    return `${BASE_URL}/${this.hashingService.generateBase64Hash(strToBeHashed)}`;
  }

  private generateRedirectUrlForUzum(params: PaymentParams) {
    const BASE_URL = 'https://www.apelsin.uz/open-service';
    const serviceId = this.configService.get<number>('UZUM_SERVICE_ID');
    return `${BASE_URL}?serviceId=${serviceId}&transactionId=${params.transactionId}&amount=${params.amount}`;
  }

  private generateRedirectUrlForClick(params: PaymentParams) {
    const BASE_URL = 'https://my.click.uz/services/pay';
    const serviceId = this.configService.get<number>('CLICK_SERVICE_ID');
    const merchantId = this.configService.get<string>('CLICK_MERCHANT_ID');
    return `${BASE_URL}?service_id=${serviceId}&merchant_id=${merchantId}&amount=${params.amount}&transaction_param=${params.transactionId}`;
  }
}
