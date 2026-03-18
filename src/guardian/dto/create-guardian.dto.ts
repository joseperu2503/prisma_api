import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { PersonDto } from 'src/person/dto/person.dto';

export class CreateGuardianDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => PersonDto)
  person: PersonDto;
}
