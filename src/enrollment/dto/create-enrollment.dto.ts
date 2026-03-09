import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';

export class StudentForEnrollmentDto {
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person: CreatePersonDto;

  @IsOptional()
  @IsString()
  password?: string;
}

export class CreateEnrollmentDto {
  @ValidateNested()
  @Type(() => StudentForEnrollmentDto)
  student: StudentForEnrollmentDto;

  @IsUUID()
  academicYearId?: string;

  @IsUUID()
  classroomId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
