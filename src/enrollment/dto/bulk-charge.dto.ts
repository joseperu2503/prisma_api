import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class BulkChargeSubscriptionPeriodDto {
  @IsDateString()
  dueDate: string;
}

export class BulkChargeSubscriptionDto {
  @IsUUID()
  planConfigurationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkChargeSubscriptionPeriodDto)
  periods: BulkChargeSubscriptionPeriodDto[];
}

export class BulkChargeProductDto {
  @IsUUID()
  productId: string;
}

export class BulkChargeDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  enrollmentIds: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkChargeProductDto)
  chargeProducts?: BulkChargeProductDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkChargeSubscriptionDto)
  chargeSubscriptions?: BulkChargeSubscriptionDto[];
}
