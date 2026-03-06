import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryColumn('text')
  id: string; // e.g. 'ADMIN', 'STUDENT', 'TEACHER', 'GUARDIAN', 'EMPLOYEE'

  @Column('text', { unique: true })
  name: string;
}
