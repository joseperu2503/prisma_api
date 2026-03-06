import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AttendanceDay } from './attendance-day.entity';
import { AttendanceType } from './attendance-type.entity';

@Entity('attendance_day_logs')
export class AttendanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AttendanceDay, (day) => day.logs)
  @JoinColumn({ name: 'attendance_day_id' })
  attendanceDay: AttendanceDay;

  @Column('uuid', { name: 'attendance_day_id' })
  attendanceDayId: string;

  @ManyToOne(() => AttendanceType)
  @JoinColumn({ name: 'type_id' })
  type: AttendanceType;

  @Column('uuid', { name: 'type_id' })
  typeId: string;

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
