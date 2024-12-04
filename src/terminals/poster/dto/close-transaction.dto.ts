import { IsNotEmpty, IsString } from 'class-validator';

export class CloseTransactionDto {
  @IsString()
  @IsNotEmpty()
  spotId: string;

  @IsString()
  @IsNotEmpty()
  spotTabletId: string;

  @IsString()
  @IsNotEmpty()
  total: string;
}
