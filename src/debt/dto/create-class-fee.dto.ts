import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateClassFeeDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  conceptId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  frequencyId: string;
}
