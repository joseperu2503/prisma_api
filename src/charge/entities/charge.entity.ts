import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
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
import { ChargeItem } from './charge-item.entity';

@Entity('charges')
export class Charge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column('uuid', { name: 'person_id' })
  personId: string;

  @ManyToOne(() => Enrollment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment | null;

  @Column('uuid', { name: 'enrollment_id', nullable: true })
  enrollmentId: string | null;

  @Column({ type: 'varchar', length: 50, name: 'status_id', default: 'PENDING' })
  statusId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'date', name: 'due_date', nullable: true })
  dueDate: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => ChargeItem, (item) => item.charge)
  items: ChargeItem[];

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
