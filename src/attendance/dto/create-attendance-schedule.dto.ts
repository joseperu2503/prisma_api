import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateAttendanceScheduleDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'checkInStart must be in HH:MM format',
  })
  checkInStart: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'checkInEnd must be in HH:MM format',
  })
  checkInEnd: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'checkOut must be in HH:MM format',
  })
  checkOut: string;
}
