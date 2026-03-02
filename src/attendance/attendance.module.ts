import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceStatus } from './entities/attendance-status.entity';
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
      AttendanceStatus,
    ]),
  ],
  exports: [],
})
export class AttendanceModule {}
