import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';

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

export class CreateCellItemDto {
  @IsUUID()
  personId: string;

  @IsUUID()
  installmentId: string;

  @IsBoolean()
  applies: boolean;

  @IsNumber()
  @Min(0)
  baseAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class ToggleAppliesItemDto {
  @IsUUID()
  personId: string;

  @IsUUID()
  installmentId: string;

  @IsBoolean()
  applies: boolean;
}

export class BulkSaveMatrixDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDebtItemDto)
  updates: UpdateDebtItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCellItemDto)
  creates: CreateCellItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToggleAppliesItemDto)
  toggles: ToggleAppliesItemDto[];
}
