import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Min, ValidateNested, IsArray } from 'class-validator';

export class UpdateDebtItemDto {
  @IsUUID()
  debtId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateDebtItemDto {
  @IsUUID()
  personId: string;

  @IsUUID()
  classFeeId: string;

  @IsUUID()
  installmentId: string;

  @IsNumber()
  @Min(0)
  amount: number;
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
