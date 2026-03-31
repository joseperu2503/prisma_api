import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('charge_frequencies')
export class ChargeFrequency {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
