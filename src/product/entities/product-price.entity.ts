import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { Class } from 'src/class/entities/class.entity';
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
import { ProductPriceTypeId } from '../enums/product-price-type-id.enum';
import { ProductPriceType } from './product-price-type.entity';
import { Product } from './product.entity';

@Entity('product_prices')
export class ProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'price_type_id', type: 'varchar', length: 20 })
  priceTypeId: ProductPriceTypeId;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  /** null = aplica a todos los años */
  @Column({ name: 'academic_year_id', type: 'uuid', nullable: true })
  academicYearId: string | null;

  /** null = aplica a todas las clases */
  @Column({ name: 'class_id', type: 'uuid', nullable: true })
  classId: string | null;

  /** null = no vinculado a matrícula específica */
  @Column({ name: 'enrollment_id', type: 'uuid', nullable: true })
  enrollmentId: string | null;

  /** null = aplica a todas las personas */
  @Column({ name: 'person_id', type: 'uuid', nullable: true })
  personId: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => ProductPriceType, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'price_type_id' })
  priceType: ProductPriceType;

  @ManyToOne(() => Product, (p) => p.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => AcademicYear, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear | null;

  @ManyToOne(() => Class, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'class_id' })
  class: Class | null;

  @ManyToOne(() => Enrollment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment | null;

  @ManyToOne(() => Person, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'person_id' })
  person: Person | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
