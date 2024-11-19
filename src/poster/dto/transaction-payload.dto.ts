import { IsNotEmpty, IsNumber } from "class-validator";

export class TransactionPayloadDto {
    @IsNotEmpty()
    @IsNumber()
    spotId: number;

    @IsNotEmpty()
    @IsNumber()
    spotTabletId: number;

    @IsNotEmpty()
    @IsNumber()
    transactionId: number;

    @IsNotEmpty()
    @IsNumber()
    payedCash: number;
}