import { IsBoolean, IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreatePlanConfigurationDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(1)
  iterationsCount: number;

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
