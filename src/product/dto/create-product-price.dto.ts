import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProductPriceDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsUUID()
  academicYearId?: string | null;

  @IsOptional()
  @IsUUID()
  classId?: string | null;

  @IsOptional()
  @IsUUID()
  enrollmentId?: string | null;
}
