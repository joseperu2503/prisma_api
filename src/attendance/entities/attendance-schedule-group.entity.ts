import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import {
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { AttendanceSchedule } from './attendance-schedule.entity';

@Entity('attendance_schedule_groups')
export class AttendanceScheduleGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(
    () => AttendanceSchedule,
    (schedule) => schedule.attendanceScheduleGroup,
  )
  attendanceSchedules: AttendanceSchedule[];

  @ManyToOne(
    () => ClassAcademicYear,
    (classAcademicYear) => classAcademicYear.attendanceScheduleGroup,
  )
  classAcademicYear: ClassAcademicYear;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
