import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Debt } from './debt.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Debt, (debt) => debt.payments)
  @JoinColumn({ name: 'debt_id' })
  debt: Debt;

  @Column('uuid', { name: 'debt_id' })
  debtId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date', name: 'paid_at' })
  paidAt: Date;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'method_id' })
  method: PaymentMethod;

  @Column({ type: 'varchar', length: 50, name: 'method_id', default: 'CASH' })
  methodId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
