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
import { ClassFee } from './class-fee.entity';
import { DebtConcept } from './debt-concept.entity';
import { DebtStatus } from './debt-status.entity';
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

  @ManyToOne(() => DebtConcept)
  @JoinColumn({ name: 'concept_id' })
  concept: DebtConcept;

  @Column('uuid', { name: 'concept_id' })
  conceptId: string;

  @ManyToOne(() => ClassFee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'class_fee_id' })
  classFee: ClassFee | null;

  @Column('uuid', { name: 'class_fee_id', nullable: true })
  classFeeId: string | null;

  @ManyToOne(() => DebtStatus)
  @JoinColumn({ name: 'status_id' })
  status: DebtStatus;

  @Column({ type: 'varchar', length: 50, name: 'status_id', default: 'PENDING' })
  statusId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  /** Primer día del mes al que pertenece la deuda. Solo para frecuencia MONTHLY. */
  @Column({ type: 'date', nullable: true, name: 'period_date' })
  periodDate: Date | null;

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
