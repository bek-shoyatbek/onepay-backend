import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentProvider, Terminal } from 'src/enums';

export class InitTransactionDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsString()
  spotId: string;

  @IsNotEmpty()
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsNotEmpty()
  @IsEnum(Terminal)
  terminal: Terminal;

  @IsString()
  @IsOptional()
  tableId?: string;

  @IsNotEmpty()
  @IsNumber()
  tip: number;
}
