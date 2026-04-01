import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class ListSalesDto {
  @IsOptional()
  @IsUUID()
  personId?: string;

  @IsOptional()
  @IsString()
  statusId?: string;

  @IsOptional()
  @IsString()
  saleTypeId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
