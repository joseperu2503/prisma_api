import { IsArray, IsUUID } from 'class-validator';

export class UpdateGuardianStudentsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds: string[];
}
