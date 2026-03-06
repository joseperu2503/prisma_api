import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AssignClassroomToYearDto {
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
