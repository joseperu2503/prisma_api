import {
  IsInt,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min
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
    message: 'entryStart must be in HH:MM format',
  })
  entryStart: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'entryEnd must be in HH:MM format',
  })
  entryEnd: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'exit must be in HH:MM format',
  })
  exit: string;
}
