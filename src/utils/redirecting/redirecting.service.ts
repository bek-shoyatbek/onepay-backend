import { Injectable } from '@nestjs/common';
import {
  PaymentParams,
  PaymentParamsForClick,
  PaymentParamsForPayme,
  PaymentParamsForUzum,
} from 'src/types/payment-params';
import { PaymentProvider } from 'src/types/payment-providers';
import { HashingService } from '../hashing/hashing.service';

@Injectable()
export class RedirectingService {
  constructor(private readonly hashingService: HashingService) {}
  public generateRedirectUrl(
    provider: PaymentProvider,
    params: PaymentParams,
  ): string {
    switch (provider) {
      case 'payme':
        return this.generateRedirectUrlForPayme(
          params as PaymentParamsForPayme,
        );
      case 'uzum':
        return this.generateRedirectUrlForUzum(params as PaymentParamsForUzum);
      case 'click':
        return this.generateRedirectUrlForClick(
          params as PaymentParamsForClick,
        );
      default:
        throw new Error('Provider not found');
    }
  }

  private generateRedirectUrlForPayme(params: PaymentParamsForPayme) {
    const BASE_URL = 'https://checkout.paycom.uz';
    const strToBeHashed = `m=${params.merchantId};ac.transactionId=${params.accountObject.transactionId};a=${params.amount};`;
    return `${BASE_URL}/${this.hashingService.generateBase64Hash(strToBeHashed)}`;
  }

  private generateRedirectUrlForUzum(params: PaymentParamsForUzum) {
    const BASE_URL = 'https://www.apelsin.uz/open-service';
    return `${BASE_URL}?serviceId=${params.serviceId}&transactionId=${params.transactionId}&amount=${params.amount}`;
  }

  private generateRedirectUrlForClick(params: PaymentParamsForClick) {
    const BASE_URL = 'https://my.click.uz/services/pay';
    return `${BASE_URL}?service_id=${params.serviceId}&merchant_id=${params.merchantId}&amount=${params.amount}&transaction_param=${params.clickTransId}&return_url=${params.returnUrl ? params.returnUrl : ''}`;
  }
}
