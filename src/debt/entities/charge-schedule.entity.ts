import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClassCharge } from './class-charge.entity';

@Entity('charge_schedules')
export class ChargeSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClassCharge, (charge) => charge.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_charge_id' })
  classCharge: ClassCharge;

  @Column('uuid', { name: 'class_charge_id' })
  classChargeId: string;

  /** Primer día del mes para MONTHLY, null para ONE_TIME / YEARLY */
  @Column({ type: 'date', nullable: true, name: 'period_date' })
  periodDate: string | null;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
