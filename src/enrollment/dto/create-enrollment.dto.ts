import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateStudentDto } from 'src/student/dto/create-student.dto';

export class CreateEnrollmentDto {
  @ValidateNested()
  @Type(() => CreateStudentDto)
  student: CreateStudentDto;

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
