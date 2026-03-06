import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateAcademicPeriodDto } from './create-academic-period.dto';

export class UpdateAcademicPeriodDto extends PartialType(
  CreateAcademicPeriodDto,
) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
