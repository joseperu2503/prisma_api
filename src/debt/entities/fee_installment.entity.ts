import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClassFee } from './class-fee.entity';

@Entity('fee_installments')
export class FeeInstallment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClassFee, (fee) => fee.installments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_fee_id' })
  classFee: ClassFee;

  @Column('uuid', { name: 'class_fee_id' })
  classFeeId: string;

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
