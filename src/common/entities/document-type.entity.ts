import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('document_types')
export class DocumentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
