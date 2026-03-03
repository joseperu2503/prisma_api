import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { Repository } from 'typeorm';
import { RegisterStudentAttendanceRequestDto } from '../dto/register-student-request.dto';
import { StudentAttendanceDay } from '../entities/student-attendance-day.entity';
import { StudentAttendanceDayLog } from '../entities/student-attendance-log.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(StudentAttendanceDay)
    private readonly studentAttendanceDayRepository: Repository<StudentAttendanceDay>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(StudentAttendanceDayLog)
    private readonly studentAttendanceDayLogRepository: Repository<StudentAttendanceDayLog>,
  ) {}

  async registerStudent(params: RegisterStudentAttendanceRequestDto) {
    const student = await this.studentRepository.findOne({
      where: { id: params.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const today = new Date();

    let studentAttendanceDay =
      await this.studentAttendanceDayRepository.findOne({
        where: { studentId: student.id, date: today },
      });

    if (!studentAttendanceDay) {
      studentAttendanceDay = this.studentAttendanceDayRepository.create({
        studentId: student.id,
        date: today,
      });
    }

    await this.studentAttendanceDayRepository.save(studentAttendanceDay);

    const studentAttendanceDayLog =
      this.studentAttendanceDayLogRepository.create({
        attendanceDayId: studentAttendanceDay.id,
        typeId: params.type,
        markedAt: today,
      });

    await this.studentAttendanceDayLogRepository.save(studentAttendanceDayLog);

    return {
      success: true,
      message: 'Student attendance registered successfully',
    };
  }
}
