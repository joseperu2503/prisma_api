import { Product } from 'src/product/entities/product.entity';
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
import { PlanConfiguration } from './plan-configuration.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'varchar', length: 100 }) name: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('uuid', { name: 'product_id' }) productId: string;

  @Column({ type: 'varchar', length: 50, name: 'billing_cycle', default: 'MONTHLY' })
  billingCycle: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' }) isActive: boolean;

  @OneToMany(() => PlanConfiguration, (c) => c.plan) configurations: PlanConfiguration[];

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
