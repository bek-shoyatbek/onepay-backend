import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsString()
  spotId: string;

  @IsString()
  spotTabletId: string;

  @IsString()
  accountUrl: string;

  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsBoolean()
  @IsNotEmpty()
  isTipOnly: boolean;

  @IsOptional()
  @IsString()
  tableId?: string;

  @IsNotEmpty()
  @IsString()
  terminal: string;

  @IsNotEmpty()
  @IsNumber()
  tip: number;
}
