import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonModule } from 'src/person/person.module';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceLog } from './entities/attendance-log.entity';
import { AttendanceScheduleGroup } from './entities/attendance-schedule-group.entity';
import { AttendanceSchedule } from './entities/attendance-schedule.entity';
import { AttendanceType } from './entities/attendance-type.entity';
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './services/attendance.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      AttendanceLog,
      AttendanceType,
      AttendanceSchedule,
      AttendanceScheduleGroup,
    ]),
    PersonModule,
  ],
  exports: [TypeOrmModule, AttendanceService],
})
export class AttendanceModule {}
