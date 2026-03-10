import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RegisterAttendanceDto {
  @IsString()
  documentTypeId: string;

  @IsString()
  documentNumber: string;

  @IsString()
  type: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
