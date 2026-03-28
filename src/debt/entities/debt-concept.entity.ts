import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DebtConceptType } from './debt-concept-type.entity';

@Entity('debt_concepts')
export class DebtConcept {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToOne(() => DebtConceptType)
  @JoinColumn({ name: 'type_id' })
  type: DebtConceptType;

  @Column({ type: 'varchar', length: 50, name: 'type_id', default: 'OTHER' })
  typeId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'default_amount',
  })
  defaultAmount: number | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

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
