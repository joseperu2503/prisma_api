import { IsDateString, IsOptional } from 'class-validator';

export class CreateChargeScheduleDto {
  @IsOptional()
  @IsDateString()
  periodDate?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;
}
