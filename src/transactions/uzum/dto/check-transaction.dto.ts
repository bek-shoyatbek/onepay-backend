export class CheckTransactionDto {
  serviceId: number;
  timestamp: number;
  params: {
    transactionId: string;
  };
}
