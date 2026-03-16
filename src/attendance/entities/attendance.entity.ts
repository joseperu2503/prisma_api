import { Role } from 'src/auth/entities/role.entity';
import { Person } from 'src/person/entities/person.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AttendanceLog } from './attendance-log.entity';
import { AttendanceSchedule } from './attendance-schedule.entity';

@Entity('attendances')
@Unique(['personId', 'date', 'attendanceScheduleId', 'roleId'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column('uuid', { name: 'person_id' })
  personId: string;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column('string', { name: 'role_id' })
  roleId: string;

  @ManyToOne(() => AttendanceSchedule)
  @JoinColumn({ name: 'attendance_schedule_id' })
  attendanceSchedule: AttendanceSchedule;

  @Column('uuid', { name: 'attendance_schedule_id' })
  attendanceScheduleId: string;

  @OneToMany(() => AttendanceLog, (log) => log.attendance)
  logs: AttendanceLog[];

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
