import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IgvAffectationTypeId } from '../enums/igv-affectation-type-id.enum';

@Entity('igv_affectation_types')
export class IgvAffectationType {
  @PrimaryColumn({ type: 'varchar', length: 5 })
  id: IgvAffectationTypeId;

  @Column({ type: 'varchar', length: 200 })
  name: string;
}
