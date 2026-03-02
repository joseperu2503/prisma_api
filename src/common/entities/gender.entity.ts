import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('genders')
export class Gender {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
