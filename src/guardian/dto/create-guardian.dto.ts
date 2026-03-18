import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';

export class CreateGuardianDto {
  /** Usar persona ya existente por su id */
  @IsOptional()
  @IsUUID()
  personId?: string;

  /** Crear nueva persona y registrarla como apoderado */
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person?: CreatePersonDto;
}
