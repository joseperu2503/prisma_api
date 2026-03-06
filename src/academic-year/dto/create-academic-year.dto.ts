import { IsNotEmpty } from 'class-validator';

export class CreateAcademicYearDto {
  @IsNotEmpty()
  year: string;
}
