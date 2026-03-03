import { Student } from 'src/student/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentAttendanceDayLog } from './student-attendance-log.entity';

@Entity('student_attendance_days')
export class StudentAttendanceDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column('uuid', { name: 'student_id' })
  studentId: string;

  @Column({ type: 'date' })
  date: Date;

  @OneToMany(() => StudentAttendanceDayLog, (log) => log.attendanceDay)
  logs: StudentAttendanceDayLog[];

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
