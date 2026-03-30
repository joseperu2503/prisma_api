import { Person } from 'src/person/entities/person.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { FeeInstallment } from './fee_installment.entity';

@Entity('person_fee_installments')
export class PersonFeeInstallment {
  @PrimaryColumn('uuid', { name: 'person_id' })
  personId: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @PrimaryColumn('uuid', { name: 'fee_installment_id' })
  feeInstallmentId: string;

  @ManyToOne(() => FeeInstallment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fee_installment_id' })
  feeInstallment: FeeInstallment;

  @Column({ type: 'boolean', default: true })
  applies: boolean;
}
