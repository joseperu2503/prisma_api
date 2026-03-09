import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
