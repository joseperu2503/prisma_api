import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('document_types')
export class DocumentType {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
