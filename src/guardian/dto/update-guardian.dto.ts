import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateGuardianDto {
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

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
