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
import { SaleItem } from './sale-item.entity';
import { SaleInstallment } from './sale-installment.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'person_id' })
  person: Person | null;

  @Column('uuid', { name: 'person_id', nullable: true })
  personId: string | null;

  @Column({
    type: 'timestamptz',
    name: 'sale_date',
    default: () => 'CURRENT_TIMESTAMP',
  })
  saleDate: Date;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'sale_type_id',
    default: 'CASH',
  })
  saleTypeId: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'status_id',
    default: 'OPEN',
  })
  statusId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'igv_amount', default: 0 })
  igvAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column('uuid', { name: 'academic_year_id', nullable: true })
  academicYearId: string | null;

  @OneToMany(() => SaleItem, (item) => item.sale)
  items: SaleItem[];

  @OneToMany(() => SaleInstallment, (inst) => inst.sale)
  installments: SaleInstallment[];

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
