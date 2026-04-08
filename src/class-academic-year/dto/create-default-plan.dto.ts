import { IsUUID } from 'class-validator';

export class CreateDefaultPlanDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  planConfigurationId: string;
}
