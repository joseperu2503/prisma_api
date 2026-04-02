import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateStudentDto } from 'src/student/dto/create-student.dto';

export class CreateEnrollmentPriceDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateEnrollmentSubscriptionDto {
  @IsUUID()
  planConfigurationId: string;
}

export class CreateEnrollmentChargeItemDto {
  @IsUUID()
  productId: string;
}

export class CreateEnrollmentChargeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEnrollmentChargeItemDto)
  items: CreateEnrollmentChargeItemDto[];
}

export class CreateEnrollmentDto {
  @ValidateNested()
  @Type(() => CreateStudentDto)
  student: CreateStudentDto;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  gradeId: string;

  @IsUUID()
  classId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEnrollmentPriceDto)
  prices?: CreateEnrollmentPriceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEnrollmentSubscriptionDto)
  subscriptions?: CreateEnrollmentSubscriptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEnrollmentChargeDto)
  charges?: CreateEnrollmentChargeDto[];
}
