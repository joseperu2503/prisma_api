import { IsNumber, IsPositive } from 'class-validator';

export class UpdateClassProductPriceDto {
  @IsNumber()
  @IsPositive()
  price: number;
}
