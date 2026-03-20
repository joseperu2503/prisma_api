import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export class FindOrCreatePersonDto {
  /** Usar persona ya existente por su id */
  @IsOptional()
  @IsUUID()
  id?: string;

  /** Crear nueva persona y registrarla como apoderado */
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePersonDto)
  new?: CreatePersonDto;
}
