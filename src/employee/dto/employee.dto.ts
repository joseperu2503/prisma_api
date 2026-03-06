import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class NewPersonDto {
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
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  genderId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateEmployeeDto {
  @IsOptional()
  @IsUUID()
  personId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NewPersonDto)
  newPerson?: NewPersonDto;

  @IsString()
  @IsNotEmpty()
  employeeTypeId: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateEmployeeTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
