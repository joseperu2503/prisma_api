import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsUUID()
  productId: string;

  @IsOptional()
  @IsString()
  billingCycle?: string = 'MONTHLY';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
