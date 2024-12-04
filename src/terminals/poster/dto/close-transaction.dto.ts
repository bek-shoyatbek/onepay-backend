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
  userId: string;

  @IsString()
  @IsNotEmpty()
  tableId: string;
}
