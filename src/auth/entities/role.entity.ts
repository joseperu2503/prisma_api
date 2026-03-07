import { PersonRole } from 'src/person/entities/person-role.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryColumn('text')
  id: string; // e.g. 'ADMIN', 'STUDENT', 'TEACHER', 'GUARDIAN', 'EMPLOYEE'

  @Column('text', { unique: true })
  name: string;

  @OneToMany(() => PersonRole, (personRole) => personRole.role)
  personRoles: PersonRole[];
}
