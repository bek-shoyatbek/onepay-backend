export class InitTransactionDto {
  orderId: string;
  userId: string;
  amount: number;
  provider: 'uzum' | 'payme' | 'click';
  tip: number;
}
