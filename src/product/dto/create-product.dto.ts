import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IgvAffectationTypeId } from '../enums/igv-affectation-type-id.enum';
import { UnitCodeId } from '../enums/unit-code-id.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsEnum(UnitCodeId)
  unitCodeId: UnitCodeId;

  @IsEnum(IgvAffectationTypeId)
  igvAffectationTypeId: IgvAffectationTypeId;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
