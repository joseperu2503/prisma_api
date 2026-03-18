import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PersonDto } from 'src/person/dto/person.dto';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';

class GuardianPersonDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => PersonDto)
  person: PersonDto;
}

export class CreateStudentDto {
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person: CreatePersonDto;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuardianPersonDto)
  guardians?: GuardianPersonDto[];
}
