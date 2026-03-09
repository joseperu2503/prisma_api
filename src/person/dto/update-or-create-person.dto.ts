import { IsOptional, IsUUID } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export class UpdateOrCreatePersonDto extends CreatePersonDto {
  @IsUUID()
  @IsOptional()
  id: string | null;
}
