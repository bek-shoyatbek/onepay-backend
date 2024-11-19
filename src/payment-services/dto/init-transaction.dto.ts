import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Terminal } from 'src/constants/terminal.constant';
import { PaymentProvider } from 'src/types/payment-providers';

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
  provider: PaymentProvider;

  @IsNotEmpty()
  @Transform(({ value }) => ("" + value).toLowerCase())
  @IsEnum(Terminal)
  terminal: Terminal;

  @IsString()
  @IsOptional()
  tableId?: string;

  @IsNotEmpty()
  @IsNumber()
  tip: number;
}
