import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { QueryAttendanceDayLogsDto } from '../dto/query-attendance-day-logs.dto';
import { QueryAttendanceHistoryDto } from '../dto/query-attendance-history.dto';
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

  @Get('my-attendance')
  getMyAttendance(
    @GetUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.getMyAttendance(user.personId, from, to);
  }
}
