import { Body, Controller, Post } from '@nestjs/common';
import { RegisterStudentRequestDto } from '../dto/register-student-request.dto';
import { AttendanceService } from '../services/attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('register-student')
  registerStudent(@Body() request: RegisterStudentRequestDto) {
    return this.attendanceService.registerStudent(request);
  }
}
