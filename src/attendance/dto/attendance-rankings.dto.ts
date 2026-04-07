import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum RankingType {
  PUNCTUALITY = 'punctuality',
  TARDINESS = 'tardiness',
  ABSENCES = 'absences',
}

export class BaseRankingDto {
  @IsUUID()
  academicYearId: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsString()
  from?: string; // yyyy-MM-dd

  @IsOptional()
  @IsString()
  to?: string; // yyyy-MM-dd

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

/** @deprecated use BaseRankingDto + separate endpoints */
export class AttendanceRankingsDto extends BaseRankingDto {
  @IsOptional()
  @IsEnum(RankingType)
  type?: RankingType;
}
