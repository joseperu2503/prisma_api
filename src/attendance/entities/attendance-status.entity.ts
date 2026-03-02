import { Entity, PrimaryColumn } from 'typeorm';

@Entity('attendance_statuses')
export class AttendanceStatus {
  @PrimaryColumn()
  id: string;
}
