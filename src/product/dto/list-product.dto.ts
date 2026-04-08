import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ListProductDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  academicYearId?: string;
}
