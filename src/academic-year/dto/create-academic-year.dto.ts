import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateAcademicYearDto {
  @IsInt()
  @Min(2000)
  @IsNotEmpty()
  year: number;
}
