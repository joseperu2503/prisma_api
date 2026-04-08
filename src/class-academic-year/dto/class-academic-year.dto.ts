import { IsUUID } from 'class-validator';

export class ClassAcademicYearDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;
}
