import { Person } from 'src/person/entities/person.entity';
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
import { DebtStatus } from './debt-status.entity';
import { ChargeSchedule } from './charge-schedule.entity';
import { Payment } from './payment.entity';

@Entity('debts')
export class Debt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column('uuid', { name: 'person_id' })
  personId: string;

  @ManyToOne(() => ChargeSchedule, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'charge_schedule_id' })
  chargeSchedule: ChargeSchedule | null;

  @Column('uuid', { name: 'charge_schedule_id', nullable: true })
  chargeScheduleId: string | null;

  @ManyToOne(() => DebtStatus)
  @JoinColumn({ name: 'status_id' })
  status: DebtStatus;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'status_id',
    default: 'PENDING',
  })
  statusId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'base_amount' })
  baseAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => Payment, (payment) => payment.debt)
  payments: Payment[];

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
