import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  paidAt: string;

  @IsString()
  methodId: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
