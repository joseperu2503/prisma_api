import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  names: string;

  @IsString()
  paternalLastName: string;

  @IsString()
  maternalLastName: string;

  @IsString()
  documentTypeId: string;

  @IsString()
  documentNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

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
