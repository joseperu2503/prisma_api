import { RelationshipType } from 'src/common/entities/relationship-type.entity';
import { Student } from 'src/student/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Guardian } from './guardian.entity';

@Entity('student_guardians')
export class StudentGuardian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column('uuid', { name: 'student_id' })
  studentId: string;

  @ManyToOne(() => Guardian)
  @JoinColumn({ name: 'guardian_id' })
  guardian: Guardian;

  @Column('uuid', { name: 'guardian_id' })
  guardianId: string;

  @ManyToOne(() => RelationshipType)
  @JoinColumn({ name: 'relationship_type_id' })
  relationshipType: RelationshipType;

  @Column('uuid', { name: 'relationship_type_id' })
  relationshipTypeId: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

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
