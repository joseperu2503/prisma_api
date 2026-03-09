import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateEmployeeDto {
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
