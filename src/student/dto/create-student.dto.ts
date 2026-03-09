import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { NewPersonDto } from 'src/employee/dto/employee.dto';

export class CreateStudentDto {
  @IsOptional()
  @IsUUID()
  personId: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewPersonDto)
  newPerson: NewPersonDto | null;

  @IsString()
  @IsNotEmpty()
  password: string;
}
