import { IsNotEmpty, IsString } from 'class-validator';

export class CloseTransactionDto {
  @IsString()
  @IsNotEmpty()
  spotId: string;

  @IsString()
  @IsNotEmpty()
  total: string;

  @IsString()
  @IsNotEmpty()
  spotTabletId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  accountUrl: string;

  @IsString()
  @IsNotEmpty()
  tableId: string;
}
