import { IsBoolean, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateClassPlanConfigurationDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  planId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
