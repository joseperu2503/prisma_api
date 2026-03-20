import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FindOrCreatePersonDto } from 'src/person/dto/find-or-create-person.dto';

export class GuardianPersonDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => FindOrCreatePersonDto)
  person: FindOrCreatePersonDto;
}

export class CreateStudentDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => FindOrCreatePersonDto)
  person: FindOrCreatePersonDto;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuardianPersonDto)
  guardians: GuardianPersonDto[];
}
