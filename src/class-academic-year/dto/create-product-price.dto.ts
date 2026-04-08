import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateClassProductPriceDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
