import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { QueryAttendanceDayLogsDto } from '../dto/query-attendance-day-logs.dto';
import { QueryAttendanceDayStudentsDto } from '../dto/query-attendance-day-students.dto';
import { QueryAttendanceHistoryDto } from '../dto/query-attendance-history.dto';
import { QueryStudentsAttendanceDto } from '../dto/query-students-attendance.dto';
import { RegisterAttendanceDto } from '../dto/register-attendance.dto';
import { AttendanceService } from '../services/attendance.service';

@Auth([RoleId.ADMIN, RoleId.STUDENT])
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('register')
  register(@Body() request: RegisterAttendanceDto, @GetUser() userId: string) {
    return this.attendanceService.registerAttendance(request, userId);
  }

  @Post('history')
  getHistory(@Body() dto: QueryAttendanceHistoryDto) {
    return this.attendanceService.getAttendanceHistory(dto);
  }

  @Post('day-logs')
  getDayLogs(@Body() dto: QueryAttendanceDayLogsDto) {
    return this.attendanceService.getAttendanceDayLogs(dto);
  }

  @Post('day-students')
  getDayStudents(@Body() dto: QueryAttendanceDayStudentsDto) {
    return this.attendanceService.getAttendanceDayStudents(
      dto.academicYearId,
      dto.date,
      dto.classId,
    );
  }

  @Get('last-attendances-day')
  lastAttendancesDay() {
    return this.attendanceService.lastAttendancesDay();
  }

  @Get('by-document/:documentNumber')
  getByDocument(
    @Param('documentNumber') documentNumber: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.getAttendanceByDocument(
      documentNumber,
      from,
      to,
    );
  }

  @Post('recalculate-statuses')
  recalculateStatuses() {
    return this.attendanceService.recalculateStatuses();
  }

  @Auth([RoleId.GUARDIAN])
  @Post('students')
  getStudentsAttendance(@Body() dto: QueryStudentsAttendanceDto) {
    return this.attendanceService.getStudentsAttendance(
      dto.studentIds,
      dto.from,
      dto.to,
    );
  }

  @Auth([RoleId.GUARDIAN])
  @Get('student/:studentId')
  getStudentAttendance(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.getStudentAttendance(studentId, from, to);
  }

  @Get('my-attendance')
  getMyAttendance(
    @GetUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.getMyAttendance(user.personId, from, to);
  }
}
