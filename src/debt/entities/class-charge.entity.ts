import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { ProductPrice } from 'src/product/entities/product-price.entity';
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
import { ChargeFrequency } from './charge-frequency.entity';
import { ChargeSchedule } from './charge-schedule.entity';

@Entity('class_charges')
export class ClassCharge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClassAcademicYear)
  @JoinColumn({ name: 'class_academic_year_id' })
  classAcademicYear: ClassAcademicYear;

  @Column('uuid', { name: 'class_academic_year_id' })
  classAcademicYearId: string;

  @ManyToOne(() => ProductPrice)
  @JoinColumn({ name: 'presentation_id' })
  productPrice: ProductPrice;

  @Column('uuid', { name: 'presentation_id' })
  productPriceId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => ChargeFrequency)
  @JoinColumn({ name: 'frequency_id' })
  frequency: ChargeFrequency;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'frequency_id',
    default: 'ONE_TIME',
  })
  frequencyId: string;

  @OneToMany(() => ChargeSchedule, (p) => p.classCharge)
  schedules: ChargeSchedule[];

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
