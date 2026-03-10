import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AssignGradeToYearDto {
  @IsUUID()
  @IsNotEmpty()
  gradeId: string;

  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
