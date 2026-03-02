import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentAttendanceDay } from './student-attendance-day.entity';

export enum StudentAttendanceDayLogType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

@Entity('student_attendance_day_logs')
export class StudentAttendanceDayLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentAttendanceDay, (day) => day.logs, { nullable: false })
  @JoinColumn({ name: 'attendance_day_id' })
  attendanceDay: StudentAttendanceDay;

  @Column({
    type: 'enum',
    enum: StudentAttendanceDayLogType,
  })
  type: StudentAttendanceDayLogType;

  @Column({
    type: 'timestamptz',
    name: 'marked_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  markedAt: Date;

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
