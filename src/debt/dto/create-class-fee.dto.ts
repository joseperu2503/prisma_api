import { Type } from 'class-transformer';
import { IsNumber, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { CreateFeeInstallmentDto } from './create-class-fee-period.dto';

export class CreateClassFeeDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  conceptId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  frequencyId: string;

  @ValidateNested({ each: true })
  @Type(() => CreateFeeInstallmentDto)
  installments: CreateFeeInstallmentDto[];
}
