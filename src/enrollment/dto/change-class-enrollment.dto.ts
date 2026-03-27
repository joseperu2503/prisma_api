import { IsUUID } from 'class-validator';

export class ChangeClassEnrollmentDto {
  @IsUUID()
  classId: string;
}
