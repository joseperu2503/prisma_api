import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  names: string;

  @IsString()
  @IsNotEmpty()
  paternalLastName: string;

  @IsString()
  @IsNotEmpty()
  maternalLastName: string;

  @IsString()
  @IsNotEmpty()
  documentTypeId: string;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

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
