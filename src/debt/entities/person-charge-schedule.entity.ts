import { Person } from 'src/person/entities/person.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChargeSchedule } from './charge-schedule.entity';

@Entity('person_charge_schedules')
export class PersonChargeSchedule {
  @PrimaryColumn('uuid', { name: 'person_id' })
  personId: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @PrimaryColumn('uuid', { name: 'charge_schedule_id' })
  chargeScheduleId: string;

  @ManyToOne(() => ChargeSchedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'charge_schedule_id' })
  chargeSchedule: ChargeSchedule;

  @Column({ type: 'boolean', default: true })
  applies: boolean;
}
