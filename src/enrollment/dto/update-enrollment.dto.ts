import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
