import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity('roles')
export class Role {
  @PrimaryColumn('text')
  id: string; // e.g. 'ADMIN', 'STUDENT', 'TEACHER', 'GUARDIAN', 'EMPLOYEE'

  @Column('text', { unique: true })
  name: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
