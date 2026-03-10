import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';

export class CreateEmployeeDto {
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person: CreatePersonDto;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
