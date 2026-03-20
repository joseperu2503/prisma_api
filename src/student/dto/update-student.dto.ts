import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  ValidateNested
} from 'class-validator';
import { UpdatePersonDto } from 'src/person/dto/update-person.dto';
import { GuardianPersonDto } from './create-student.dto';

export class UpdateStudentDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePersonDto)
  person?: UpdatePersonDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuardianPersonDto)
  guardians?: GuardianPersonDto[];
}
