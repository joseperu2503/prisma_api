import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PaymentEntryDto {
  @IsString()
  methodId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class PayInstallmentDto {
  @IsDateString()
  paidAt: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentEntryDto)
  payments: PaymentEntryDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
