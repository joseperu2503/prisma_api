import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { Class } from 'src/class/entities/class.entity';
import { PlanConfiguration } from 'src/plan/entities/plan-configuration.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('default_plans')
@Unique(['classId', 'academicYearId', 'planConfigurationId'])
export class DefaultPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column('uuid', { name: 'class_id' })
  classId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @Column('uuid', { name: 'academic_year_id' })
  academicYearId: string;

  @ManyToOne(() => PlanConfiguration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_configuration_id' })
  planConfiguration: PlanConfiguration;

  @Column('uuid', { name: 'plan_configuration_id' })
  planConfigurationId: string;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
