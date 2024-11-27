import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  spotTabletId?: string;

  @IsNotEmpty()
  @IsString()
  terminal: string;

  @IsNotEmpty()
  @IsNumber()
  tip: number;
}
