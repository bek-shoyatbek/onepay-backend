export class InitTransactionDto {
  amount: number;
  provider: 'uzum' | 'payme' | 'click';
  tip: number;
}
