import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class AttendanceLogsDto {
  @IsUUID()
  @IsOptional()
  classId?: string;

  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsUUID()
  @IsOptional()
  academicYearId?: string;

  @IsString()
  date: string; // 'YYYY-MM-DD'

  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}
