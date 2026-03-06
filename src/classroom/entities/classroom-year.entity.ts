import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Classroom } from './classroom.entity';

@Entity('classroom_years')
export class ClassroomYear {
  @PrimaryColumn({ name: 'classroom_id', type: 'uuid' })
  classroomId: string;

  @PrimaryColumn({ name: 'academic_year_id', type: 'uuid' })
  academicYearId: string;

  @ManyToOne(() => Classroom)
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;

  @ManyToOne(() => AcademicYear)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @Column({ name: 'is_active', type: 'boolean', default: true })
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
