import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentProvider } from 'src/types/payment-providers';

export class InitTransactionDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;
  @IsString()
  userId: string;
  @IsNotEmpty()
  @IsNumber()
  amount: number;
  @IsNotEmpty()
  provider: PaymentProvider;
  @IsNotEmpty()
  @IsNumber()
  tip: number;
}
