export interface PaymentParams {
  transactionId: string;
  amount: number;
}

/**
 * For Payme
 * @see https://developer.help.paycom.uz/initsializatsiya-platezhey/otpravka-cheka-po-metodu-get
 */
export interface PaymentParamsForPayme {
  merchantId: string;
  accountObject: {
    transactionId: string;
  };
  amount: number;
  lang?: 'uz' | 'ru' | 'en';
  cancellationUrl?: string;
  cancellationTimeout?: number;
  currencyCodeISO?: string;
}

/**
 * For Click
 * @see https://docs.click.uz/en/click-api-request/
 */
export interface PaymentParamsForClick {
  clickTransId: number;
  serviceId: number;
  merchantId?: string;
  clickPaydocId: number;
  merchantUserId?: string;
  merchantTransId: string;
  amount: number;
  action: 0 | 1;
  error: 0 | 1;
  errorNote: string;
  signTime: string;
  signString: string;
  merchantPrepareId: number;
  returnUrl?: string;
}

/**
 * For Uzum
 * @example https://www.apelsin.uz/open-service?serviceId=498616604&transactionId=665d6a30e2ad9610ad03e8e5&amount=100000
 */
export interface PaymentParamsForUzum {
  serviceId: number;
  transactionId: string;
  amount: number;
}
