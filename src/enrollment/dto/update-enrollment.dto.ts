import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsUUID()
  academicYearId?: string | null;

  @IsOptional()
  @IsUUID()
  classroomId?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
