import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum RankingType {
  PUNCTUALITY = 'punctuality',
  TARDINESS = 'tardiness',
  ABSENCES = 'absences',
}

export class AttendanceRankingsDto {
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

  /** Si se omite, devuelve top 3 de cada tipo (vista resumen). */
  @IsOptional()
  @IsEnum(RankingType)
  type?: RankingType;

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
