import { ProductPrice } from 'src/product/entities/product-price.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (sale) => sale.items)
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column('uuid', { name: 'sale_id' })
  saleId: string;

  @ManyToOne(() => ProductPrice, { eager: false })
  @JoinColumn({ name: 'product_presentation_id' })
  productPresentation: ProductPrice;

  @Column('uuid', { name: 'product_presentation_id' })
  productPresentationId: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'igv_amount', default: 0 })
  igvAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;
}
