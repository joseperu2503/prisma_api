import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID, Min, ValidateNested, IsArray } from 'class-validator';

export class UpdateDebtItemDto {
  @IsUUID()
  debtId: string;

  @IsNumber()
  @Min(0)
  baseAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateDebtItemDto {
  @IsUUID()
  personId: string;

  @IsUUID()
  installmentId: string;

  @IsNumber()
  @Min(0)
  baseAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class BulkSaveMatrixDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDebtItemDto)
  updates: UpdateDebtItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDebtItemDto)
  creates: CreateDebtItemDto[];
}
