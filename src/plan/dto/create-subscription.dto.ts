import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  personId: string;

  @IsOptional()
  @IsUUID()
  enrollmentId?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
