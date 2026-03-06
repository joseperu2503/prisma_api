import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAcademicPeriodDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
