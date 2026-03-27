import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { FindOrCreatePersonDto } from 'src/person/dto/find-or-create-person.dto';

export class CreateGuardianDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => FindOrCreatePersonDto)
  person: FindOrCreatePersonDto;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
