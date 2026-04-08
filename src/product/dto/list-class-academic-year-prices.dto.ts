import { IsUUID } from 'class-validator';

export class ListClassAcademicYearPricesDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;
}
