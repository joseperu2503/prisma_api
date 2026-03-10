import { Role } from 'src/auth/entities/role.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Person } from './person.entity';

@Index(['personId', 'roleId'], { unique: true })
@Entity('person_roles')
export class PersonRole {
  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @PrimaryColumn('uuid', { name: 'person_id' })
  personId: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @PrimaryColumn('uuid', { name: 'role_id' })
  roleId: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
