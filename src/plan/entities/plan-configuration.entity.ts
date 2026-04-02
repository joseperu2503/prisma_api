import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { Class } from 'src/class/entities/class.entity';
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
import { Plan } from './plan.entity';
import { Subscription } from './subscription.entity';

@Entity('plan_configurations')
export class PlanConfiguration {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Plan, (p) => p.configurations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column('uuid', { name: 'plan_id' }) planId: string;

  @Column({ type: 'date', name: 'start_date' }) startDate: string;

  @Column({ type: 'date', name: 'end_date' }) endDate: string;

  @ManyToOne(() => Class, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'class_id' })
  class: Class | null;

  @Column('uuid', { name: 'class_id', nullable: true }) classId: string | null;

  @ManyToOne(() => AcademicYear, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear | null;

  @Column('uuid', { name: 'academic_year_id', nullable: true }) academicYearId: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' }) isActive: boolean;

  @OneToMany(() => Subscription, (s) => s.planConfiguration) subscriptions: Subscription[];

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
