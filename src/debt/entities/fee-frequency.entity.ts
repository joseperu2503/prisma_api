import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fee_frequencies')
export class FeeFrequency {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
