import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('relationship_types')
export class RelationshipType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;
}
