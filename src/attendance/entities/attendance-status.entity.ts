import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AttendanceStatusId } from '../enums/attenance-status-id.enum';

@Entity('attendance_statuses')
export class AttendanceStatus {
  @PrimaryColumn('varchar', { length: 50 })
  id: AttendanceStatusId;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

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
