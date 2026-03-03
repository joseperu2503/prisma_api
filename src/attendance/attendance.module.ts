import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceType } from './entities/attendance-type.entity';
import { StudentAttendanceDay } from './entities/student-attendance-day.entity';
import { StudentAttendanceDayLog } from './entities/student-attendance-log.entity';
import { AttendanceService } from './services/attendance.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [
    TypeOrmModule.forFeature([
      StudentAttendanceDay,
      StudentAttendanceDayLog,
      Student,
      AttendanceType,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class AttendanceModule {}
