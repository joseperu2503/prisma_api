import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('genders')
export class Gender {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
