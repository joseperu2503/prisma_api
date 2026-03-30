import { IsDateString, IsOptional } from 'class-validator';

export class CreateFeeInstallmentDto {
  @IsOptional()
  @IsDateString()
  periodDate?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;
}
