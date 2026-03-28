import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ListDebtDto {
  @IsOptional()
  @IsUUID()
  personId?: string;

  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @IsOptional()
  @IsUUID()
  conceptId?: string;

  @IsOptional()
  @IsString()
  statusId?: string;
}
