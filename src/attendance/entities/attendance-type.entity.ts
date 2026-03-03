import {
  Column,
  Entity,
  PrimaryColumn
} from 'typeorm';

@Entity('attendance_types')
export class AttendanceType {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;
}
