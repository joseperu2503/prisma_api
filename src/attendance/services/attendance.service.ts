import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterStudentRequestDto } from '../dto/register-student-request.dto';
import { StudentAttendanceDay } from '../entities/student-attendance-day.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(StudentAttendanceDay)
    private readonly studentAttendanceDayRepository: Repository<StudentAttendanceDay>,
  ) {}

  async registerStudent(params: RegisterStudentRequestDto) {
    return 'estudiante registrada';
  }
}
