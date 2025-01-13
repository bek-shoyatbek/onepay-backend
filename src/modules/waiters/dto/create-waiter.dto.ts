import { IsNotEmpty, IsString } from "class-validator";

export class CreateWaiterDto {
    @IsString()
    @IsNotEmpty()
    fullname: string;

    @IsString()
    @IsNotEmpty()
    image: string;

    @IsString()
    @IsNotEmpty()
    spotId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
}