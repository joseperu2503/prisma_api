import { IsUUID } from 'class-validator';

export class CreateDefaultProductDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  productId: string;
}
