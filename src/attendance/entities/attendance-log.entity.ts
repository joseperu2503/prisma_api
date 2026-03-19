import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AttendanceStatus } from './attendance-status.entity';
import { AttendanceType } from './attendance-type.entity';
import { Attendance } from './attendance.entity';

@Entity('attendance_logs')
@Unique(['attendanceId', 'typeId'])
export class AttendanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Attendance, (day) => day.logs)
  @JoinColumn({ name: 'attendance_id' })
  attendance: Attendance;

  @Column('uuid', { name: 'attendance_id' })
  attendanceId: string;

  @ManyToOne(() => AttendanceType)
  @JoinColumn({ name: 'type_id' })
  type: AttendanceType;

  @Column('uuid', { name: 'type_id' })
  typeId: string;

  @ManyToOne(() => AttendanceStatus)
  @JoinColumn({ name: 'status_id' })
  status: AttendanceStatus;

  @Column('varchar', { name: 'status_id', length: 50 })
  statusId: string;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column('uuid', { name: 'created_by_id' })
  createdById: string;
}
