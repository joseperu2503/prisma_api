import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { FindOrCreatePersonDto } from 'src/person/dto/find-or-create-person.dto';

export class CreateEmployeeDto {
  @ValidateNested()
  @Type(() => FindOrCreatePersonDto)
  person: FindOrCreatePersonDto;

  @IsNotEmpty()
  @IsUUID()
  employeeTypeId: string;
}
