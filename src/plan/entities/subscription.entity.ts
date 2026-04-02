import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Person } from 'src/person/entities/person.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanConfiguration } from './plan-configuration.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column('uuid', { name: 'person_id' }) personId: string;

  @ManyToOne(() => PlanConfiguration, (c) => c.subscriptions)
  @JoinColumn({ name: 'plan_configuration_id' })
  planConfiguration: PlanConfiguration;

  @Column('uuid', { name: 'plan_configuration_id' }) planConfigurationId: string;

  @ManyToOne(() => Enrollment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment | null;

  @Column('uuid', { name: 'enrollment_id', nullable: true }) enrollmentId: string | null;

  @Column({ type: 'varchar', length: 50, name: 'status_id', default: 'ACTIVE' }) statusId: string;

  @Column({ type: 'date', name: 'start_date' }) startDate: string;

  @Column({ type: 'text', nullable: true }) notes: string | null;

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
