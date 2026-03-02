import { IsUUID } from 'class-validator';

export class RegisterStudentRequestDto {
  @IsUUID()
  studentId: string;
}
