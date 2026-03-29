import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDebtDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  statusId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
