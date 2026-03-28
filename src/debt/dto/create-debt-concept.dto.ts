import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDebtConceptDto {
  @IsString()
  name: string;

  @IsString()
  typeId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultAmount?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
