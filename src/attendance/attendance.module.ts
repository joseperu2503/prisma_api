import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceLog } from './entities/attendance-log.entity';
import { AttendanceType } from './entities/attendance-type.entity';
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './services/attendance.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [
    TypeOrmModule.forFeature([Attendance, AttendanceLog, AttendanceType]),
  ],
  exports: [TypeOrmModule, AttendanceService],
})
export class AttendanceModule {}
