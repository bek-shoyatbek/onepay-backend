import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TransactionPayloadDto {
    @IsNotEmpty()
    @IsString()
    spotId: string;

    @IsNotEmpty()
    @IsString()
    spotTabletId: string;

    @IsNotEmpty()
    @IsString()
    transactionId: string;

    @IsNotEmpty()
    @IsNumber()
    total: number;
}