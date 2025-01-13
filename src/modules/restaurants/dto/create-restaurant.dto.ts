import {
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  spotId: string;

  @IsString()
  @IsOptional()
  image?: string;
}