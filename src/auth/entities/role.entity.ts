import { PersonRole } from 'src/person/entities/person-role.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryColumn('text')
  id: string; // e.g. 'ADMIN', 'STUDENT', 'TEACHER', 'GUARDIAN', 'EMPLOYEE'

  @Column('text', { unique: true })
  name: string;

  @OneToMany(() => PersonRole, (personRole) => personRole.role)
  personRoles: PersonRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];
}
