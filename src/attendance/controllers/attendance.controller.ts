import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleCode } from 'src/auth/enums/role-code.enum';
import { RegisterAttendanceDto } from '../dto/register-attendance.dto';
import { AttendanceService } from '../services/attendance.service';

@Auth([RoleCode.ADMIN, RoleCode.STUDENT])
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
}
