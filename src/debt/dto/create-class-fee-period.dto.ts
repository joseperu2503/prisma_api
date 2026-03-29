import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateFeeInstallmentDto {
  @IsOptional()
  @IsDateString()
  periodDate?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsNumber()
  @Min(0)
  amount: number;
}
