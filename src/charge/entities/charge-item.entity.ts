import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Charge } from './charge.entity';

@Entity('charge_items')
export class ChargeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Charge, (charge) => charge.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'charge_id' })
  charge: Charge;

  @Column('uuid', { name: 'charge_id' })
  chargeId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;
}
