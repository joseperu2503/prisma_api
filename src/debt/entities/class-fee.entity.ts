import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DebtConcept } from './debt-concept.entity';
import { FeeFrequency } from './fee-frequency.entity';

@Entity('class_fees')
export class ClassFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClassAcademicYear)
  @JoinColumn({ name: 'class_academic_year_id' })
  classAcademicYear: ClassAcademicYear;

  @Column('uuid', { name: 'class_academic_year_id' })
  classAcademicYearId: string;

  @ManyToOne(() => DebtConcept)
  @JoinColumn({ name: 'concept_id' })
  concept: DebtConcept;

  @Column('uuid', { name: 'concept_id' })
  conceptId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => FeeFrequency)
  @JoinColumn({ name: 'frequency_id' })
  frequency: FeeFrequency;

  @Column({ type: 'varchar', length: 50, name: 'frequency_id', default: 'ONE_TIME' })
  frequencyId: string;

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
