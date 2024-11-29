import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PosterCloseOrderPayload {
  @IsNotEmpty()
  @IsString()
  spotId: string;

  @IsNotEmpty()
  @IsString()
  spotTabletId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  total: number;
}
