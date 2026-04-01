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
import { IgvAffectationTypeId } from '../enums/igv-affectation-type-id.enum';
import { UnitCodeId } from '../enums/unit-code-id.enum';
import { IgvAffectationType } from './igv-affectation-type.entity';
import { ProductPrice } from './product-price.entity';
import { UnitCode } from './unit-code.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'unit_code_id', type: 'varchar', length: 10 })
  unitCodeId: UnitCodeId;

  @Column({ name: 'igv_affectation_type_id', type: 'varchar', length: 5 })
  igvAffectationTypeId: IgvAffectationTypeId;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => UnitCode, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unit_code_id' })
  unitCode: UnitCode;

  @ManyToOne(() => IgvAffectationType, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'igv_affectation_type_id' })
  igvAffectationType: IgvAffectationType;

  @OneToMany(() => ProductPrice, (p) => p.product)
  prices: ProductPrice[];

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
