import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProductPriceTypeId } from '../enums/product-price-type-id.enum';

@Entity('product_price_types')
export class ProductPriceType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: ProductPriceTypeId;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Mayor prioridad = número más bajo (1 = más específico) */
  @Column({ type: 'int' })
  priority: number;
}
