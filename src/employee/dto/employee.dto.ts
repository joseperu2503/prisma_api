import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsUUID()
  @IsNotEmpty()
  personId: string;

  @IsUUID()
  @IsNotEmpty()
  employeeTypeId: string;

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
