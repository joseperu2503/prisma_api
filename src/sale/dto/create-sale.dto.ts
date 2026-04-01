import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSaleItemDto {
  @IsUUID()
  productPresentationId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsString()
  igvAffectationTypeId: string;
}

export class CreateSaleInstallmentDto {
  @IsNumber()
  installmentNumber: number;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  dueDate: string;
}

export class CreateSaleDto {
  @IsOptional()
  @IsUUID()
  personId?: string;

  @IsOptional()
  @IsDateString()
  saleDate?: string;

  @IsString()
  saleTypeId: string;

  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInstallmentDto)
  installments: CreateSaleInstallmentDto[];
}
