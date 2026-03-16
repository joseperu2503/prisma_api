import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { AttendanceScheduleGroup } from 'src/attendance/entities/attendance-schedule-group.entity';
import { Class } from 'src/class/entities/class.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('class_academic_years')
export class ClassAcademicYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column('uuid', { name: 'class_id' })
  classId: string;

  @ManyToOne(() => AcademicYear)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @Column('uuid', { name: 'academic_year_id' })
  academicYearId: string;

  @OneToOne(() => AttendanceScheduleGroup)
  @JoinColumn({ name: 'attendance_schedule_group_id' })
  attendanceScheduleGroup: AttendanceScheduleGroup;

  @Column('uuid', { name: 'attendance_schedule_group_id' })
  attendanceScheduleGroupId: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

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
