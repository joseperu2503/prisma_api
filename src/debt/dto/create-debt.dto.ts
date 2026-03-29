import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDebtDto {
  @IsUUID()
  personId: string;

  @IsUUID()
  conceptId: string;

  @IsNumber()
  @Min(0)
  baseAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
