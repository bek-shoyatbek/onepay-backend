import { PaymentProvider, Terminal } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
