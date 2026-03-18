import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePersonDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  names?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  paternalLastName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  maternalLastName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  documentTypeId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  documentNumber?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  genderId?: string;
}
