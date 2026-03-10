import { IsOptional, IsString } from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  names?: string;

  @IsOptional()
  @IsString()
  paternalLastName?: string;

  @IsOptional()
  @IsString()
  maternalLastName?: string;

  @IsOptional()
  @IsString()
  documentTypeId?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;
}
