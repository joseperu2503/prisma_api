import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { FindOrCreatePersonDto } from 'src/person/dto/find-or-create-person.dto';

export class CreateAdminDto {
  @ValidateNested()
  @Type(() => FindOrCreatePersonDto)
  person: FindOrCreatePersonDto;

  @IsOptional()
  @IsString()
  password?: string;
}
