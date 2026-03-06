import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  classroomId: string;

  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
