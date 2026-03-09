import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreateStudentDto } from 'src/student/dto/create-student.dto';

export class CreateEnrollmentDto {
  @ValidateNested()
  @Type(() => CreateStudentDto)
  student: CreateStudentDto;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  classroomId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
