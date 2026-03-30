import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IgvAffectationTypeId } from '../enums/igv-affectation-type-id.enum';
import { UnitCodeId } from '../enums/unit-code-id.enum';
import { CreatePresentationDto } from './create-presentation.dto';

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePresentationDto)
  presentations?: CreatePresentationDto[];
}
