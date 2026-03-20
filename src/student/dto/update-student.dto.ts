import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  ValidateNested
} from 'class-validator';
import { FindOrCreatePersonDto } from 'src/person/dto/find-or-create-person.dto';
import { GuardianPersonDto } from './create-student.dto';

export class UpdateStudentDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FindOrCreatePersonDto)
  person?: FindOrCreatePersonDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuardianPersonDto)
  guardians?: GuardianPersonDto[];
}
