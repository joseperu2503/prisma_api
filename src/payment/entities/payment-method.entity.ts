import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
