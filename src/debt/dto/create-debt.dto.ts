import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDebtDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  conceptId: string;

  @IsNumber()
  @Min(0)
  amount: number;

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
