import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { CreateStudentDto } from 'src/student/dto/create-student.dto';

export class ChargeScheduleOverrideDto {
  @IsUUID()
  chargeScheduleId: string;

  @IsBoolean()
  applies: boolean;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateEnrollmentDto {
  @ValidateNested()
  @Type(() => CreateStudentDto)
  student: CreateStudentDto;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  gradeId: string;

  @IsUUID()
  classId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChargeScheduleOverrideDto)
  chargeOverrides?: ChargeScheduleOverrideDto[];
}
