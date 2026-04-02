import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { Class } from 'src/class/entities/class.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity('default_products')
@Unique(['classId', 'academicYearId', 'productId'])
export class DefaultProduct {
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

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
