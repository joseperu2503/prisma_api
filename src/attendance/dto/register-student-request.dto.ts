import { IsString, IsUUID } from 'class-validator';

export class RegisterStudentAttendanceRequestDto {
  @IsUUID()
  studentId: string;

  @IsString()
  type: string;
}
