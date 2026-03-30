import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { CreateFeeInstallmentDto } from './create-class-fee-period.dto';

export class StudentInstallmentEntryDto {
  @IsNumber()
  index: number;

  @IsBoolean()
  applies: boolean;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class StudentFeeEntryDto {
  @IsUUID()
  personId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentInstallmentEntryDto)
  installments: StudentInstallmentEntryDto[];
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentFeeEntryDto)
  students?: StudentFeeEntryDto[];
}
