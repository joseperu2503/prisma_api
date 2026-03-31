import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateClassChargeDto {
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
