import {
    IsString,
    IsOptional,
    MaxLength,
    MinLength
} from 'class-validator';

export class UpdateRestaurantDto {
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(100)
    title?: string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(200)
    location?: string;

    @IsString()
    @IsOptional()
    image?: string;
}