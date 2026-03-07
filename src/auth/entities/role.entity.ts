import { PersonRole } from 'src/person/entities/person-role.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true, nullable: true })
  code: string;

  @Column('text', { unique: true })
  name: string;

  @Column('boolean', { name: 'is_employee', default: false })
  isEmployee: boolean;

  @OneToMany(() => PersonRole, (personRole) => personRole.role)
  personRoles: PersonRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];
}
