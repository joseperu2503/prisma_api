import { IsOptional, IsString } from 'class-validator';

export class QueryAcademicYearDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
