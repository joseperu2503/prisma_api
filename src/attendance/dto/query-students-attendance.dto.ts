import { IsArray, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class QueryStudentsAttendanceDto {
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds: string[];

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
