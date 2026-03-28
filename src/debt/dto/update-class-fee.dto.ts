import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateClassFeeDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  frequencyId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
