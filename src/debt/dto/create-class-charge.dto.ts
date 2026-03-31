import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { CreateChargeScheduleDto } from './create-charge-schedule.dto';

export class StudentInstallmentEntryDto {
  @IsNumber()
  index: number;

  @IsBoolean()
  applies: boolean;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class StudentChargeEntryDto {
  @IsUUID()
  personId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentInstallmentEntryDto)
  installments: StudentInstallmentEntryDto[];
}

export class CreateClassChargeDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  presentationId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  frequencyId: string;

  @ValidateNested({ each: true })
  @Type(() => CreateChargeScheduleDto)
  installments: CreateChargeScheduleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentChargeEntryDto)
  students?: StudentChargeEntryDto[];
}
