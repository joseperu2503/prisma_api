import { IsBoolean, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreatePlanConfigurationDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
