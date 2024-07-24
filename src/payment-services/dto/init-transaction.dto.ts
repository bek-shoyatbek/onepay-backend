import { PaymentProvider } from 'src/types/payment-providers';

export class InitTransactionDto {
  orderId: string;
  userId: string;
  amount: number;
  provider: PaymentProvider;
  tip: number;
}
