import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignPeriodToYearDto {
  @IsUUID()
  @IsNotEmpty()
  academicPeriodId: string;

  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
