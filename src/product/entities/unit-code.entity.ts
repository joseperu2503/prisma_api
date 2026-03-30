import { Column, Entity, PrimaryColumn } from 'typeorm';
import { UnitCodeId } from '../enums/unit-code-id.enum';

@Entity('unit_codes')
export class UnitCode {
  @PrimaryColumn({ type: 'varchar', length: 10 })
  id: UnitCodeId;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** SUNAT catalog 6 description */
  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;
}
