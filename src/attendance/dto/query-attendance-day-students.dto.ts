import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryAttendanceDayStudentsDto {
  @IsUUID()
  academicYearId: string;

  @IsString()
  date: string; // 'YYYY-MM-DD'

  @IsUUID()
  @IsOptional()
  classId?: string;
}
