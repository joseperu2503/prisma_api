import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateAcademicYearDto } from './create-academic-year.dto';

export class UpdateAcademicYearDto extends PartialType(CreateAcademicYearDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
