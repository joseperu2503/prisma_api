import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

export interface PaymentEntry {
  methodId: string;
  amount: number;
  reference?: string;
}

@Entity('sale_installments')
export class SaleInstallment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (sale) => sale.installments)
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column('uuid', { name: 'sale_id' })
  saleId: string;

  @Column({ type: 'int', name: 'installment_number' })
  installmentNumber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date', name: 'due_date' })
  dueDate: Date;

  @Column({ type: 'timestamptz', name: 'paid_at', nullable: true })
  paidAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  payments: PaymentEntry[] | null;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'status_id',
    default: 'PENDING',
  })
  statusId: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

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
