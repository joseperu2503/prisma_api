import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { Class } from 'src/class/entities/class.entity';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { PersonModule } from 'src/person/person.module';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceScheduleController } from './controllers/attendance-schedule.controller';
import { AttendanceLog } from './entities/attendance-log.entity';
import { AttendanceScheduleGroup } from './entities/attendance-schedule-group.entity';
import { AttendanceSchedule } from './entities/attendance-schedule.entity';
import { AttendanceStatus } from './entities/attendance-status.entity';
import { AttendanceType } from './entities/attendance-type.entity';
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './services/attendance.service';
import { AttendanceScheduleService } from './services/attendance-schedule.service';

@Module({
  controllers: [AttendanceController, AttendanceScheduleController],
  providers: [AttendanceService, AttendanceScheduleService],
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      AttendanceLog,
      AttendanceType,
      AttendanceStatus,
      AttendanceSchedule,
      AttendanceScheduleGroup,
      ClassAcademicYear,
      Class,
      AcademicYear,
    ]),
    PersonModule,
  ],
  exports: [TypeOrmModule, AttendanceService, AttendanceScheduleService],
})
export class AttendanceModule {}
