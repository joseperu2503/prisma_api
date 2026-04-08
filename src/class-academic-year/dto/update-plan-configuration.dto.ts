import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateClassPlanConfigurationDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
