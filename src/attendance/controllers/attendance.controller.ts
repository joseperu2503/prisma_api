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
import { User } from 'src/auth/entities/user.entity';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { AttendanceLogsDto } from '../dto/attendance-logs.dto';
import {
  BaseRankingDto
} from '../dto/attendance-rankings.dto';
import { QueryAttendanceHistoryDto } from '../dto/query-attendance-history.dto';
import { QueryStudentsAttendanceDto } from '../dto/query-students-attendance.dto';
import { RegisterAttendanceDto } from '../dto/register-attendance.dto';
import { StudentAttendancesDto } from '../dto/student-attendances.dto';
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

  @Post('logs')
  getDayLogs(@Body() dto: AttendanceLogsDto) {
    return this.attendanceService.getAttendanceLogs(dto);
  }

  @Post('students')
  getStudentAttendances(@Body() dto: StudentAttendancesDto) {
    return this.attendanceService.getStudentAttendances(
      dto.academicYearId,
      dto.date,
      dto.classId,
    );
  }

  @Get('last-attendances-day')
  lastAttendancesDay() {
    return this.attendanceService.lastAttendancesDay();
  }

  @Post('rankings/punctuality')
  getPunctualityRanking(@Body() dto: BaseRankingDto) {
    return this.attendanceService.getPunctualityRanking(dto);
  }

  @Post('rankings/tardiness')
  getTardinessRanking(@Body() dto: BaseRankingDto) {
    return this.attendanceService.getTardinessRanking(dto);
  }

  @Post('rankings/absences')
  getAbsencesRanking(@Body() dto: BaseRankingDto) {
    return this.attendanceService.getAbsencesRanking(dto);
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
    @GetUser() user: User,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.getMyAttendance(user.personId, from, to);
  }
}
