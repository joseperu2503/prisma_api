import { Role } from 'src/auth/entities/role.entity';
import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AttendanceType } from './attendance-type.entity';
import { Attendance } from './attendance.entity';

@Entity('attendance_logs')
export class AttendanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Attendance, (day) => day.logs)
  @JoinColumn({ name: 'attendance_day_id' })
  attendance: Attendance;

  @Column('uuid', { name: 'attendance_day_id' })
  attendanceId: string;

  @ManyToOne(() => AttendanceType)
  @JoinColumn({ name: 'type_id' })
  type: AttendanceType;

  @Column('uuid', { name: 'type_id' })
  typeId: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column('string', { name: 'role_id' })
  roleId: string;

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
