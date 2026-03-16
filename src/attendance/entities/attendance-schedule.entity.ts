import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AttendanceScheduleGroup } from './attendance-schedule-group.entity';

@Entity('attendance_schedules')
export class AttendanceSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'day_of_week', type: 'smallint' })
  dayOfWeek: number;

  /** Hora en que abre la ventana de entrada (HH:MM:SS) */
  @Column({ name: 'entry_start', type: 'time' })
  entryStart: string;

  /** Hora en que cierra la ventana de entrada / hora límite de entrada (HH:MM:SS) */
  @Column({ name: 'entry_end', type: 'time' })
  entryEnd: string;

  /** Hora de salida / inicio de ventana de salida (HH:MM:SS) */
  @Column({ name: 'exit_time', type: 'time' })
  exit: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(
    () => AttendanceScheduleGroup,
    (group) => group.attendanceSchedules,
  )
  @JoinColumn({ name: 'attendance_schedule_group_id' })
  attendanceScheduleGroup: AttendanceScheduleGroup;

  @Column('uuid', { name: 'attendance_schedule_group_id' })
  attendanceScheduleGroupId: string;

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
