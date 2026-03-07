import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryColumn('text')
  id: string; // e.g., 'CREATE_USER', 'VIEW_PERSON'

  @Column('text', { unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];
}
