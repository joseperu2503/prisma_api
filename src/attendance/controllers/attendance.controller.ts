import { Body, Controller, Post } from '@nestjs/common';
import { RegisterStudentAttendanceRequestDto } from '../dto/register-student-request.dto';
import { AttendanceService } from '../services/attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('register-student')
  registerStudent(@Body() request: RegisterStudentAttendanceRequestDto) {
    return this.attendanceService.registerStudent(request);
  }
}
