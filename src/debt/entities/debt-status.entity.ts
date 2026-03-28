import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('debt_statuses')
export class DebtStatus {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
