import { IsString, IsUUID } from 'class-validator';

export class RegisterAttendanceDto {
  @IsUUID()
  documentTypeId: string;

  @IsString()
  documentNumber: string;

  @IsString()
  type: string;
}
