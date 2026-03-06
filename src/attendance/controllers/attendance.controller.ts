import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegisterAttendanceDto } from '../dto/register-attendance.dto';
import { AttendanceService } from '../services/attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('register')
  register(@Body() request: RegisterAttendanceDto) {
    return this.attendanceService.registerAttendance(request);
  }

  @Get('last-attendances-day')
  lastAttendancesDay() {
    return this.attendanceService.lastAttendancesDay();
  }
}
