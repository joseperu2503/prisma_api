import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;
}
