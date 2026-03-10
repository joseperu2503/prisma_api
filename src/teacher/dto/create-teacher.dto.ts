import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';

export class CreateTeacherDto {
  @ValidateNested()
  @Type(() => CreatePersonDto)
  person: CreatePersonDto;

  @IsOptional()
  @IsString()
  password?: string;
}
