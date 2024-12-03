export class CreateFinanceTransactionDto {
  id: number;
  type: number;
  category: number;
  userId: number;
  amountFrom: number;
  amountTo: number;
  accountFrom: number;
  accountTo: number;
  date: string;
  comment: string;
}
