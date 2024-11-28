export class CreateTransactionDto {
  serviceId: number;
  timestamp: number;
  transId: string;
  params: {
    account: string;
    transactionId: string;
    [key: string]: any;
  };
  amount: number;
}
