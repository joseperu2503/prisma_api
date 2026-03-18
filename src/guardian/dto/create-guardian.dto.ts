import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { PersonDto } from 'src/person/dto/person.dto';

export class CreateGuardianDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => PersonDto)
  person: PersonDto;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];
}
