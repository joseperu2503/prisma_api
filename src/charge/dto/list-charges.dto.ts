import { IsOptional, IsUUID } from 'class-validator';

export class ListChargesDto {
  @IsOptional()
  @IsUUID()
  personId?: string;

  @IsOptional()
  @IsUUID()
  enrollmentId?: string;

  @IsOptional()
  @IsUUID()
  academicYearId?: string;
}
