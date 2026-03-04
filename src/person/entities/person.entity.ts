import { User } from 'src/auth/entities/user.entity';
import { DocumentType } from 'src/common/entities/document-type.entity';
import { Gender } from 'src/common/entities/gender.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('people')
@Unique('UQ_people_document', ['documentTypeId', 'documentNumber'])
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.person, {
    nullable: true,
  })
  user: User | null;

  @Column({ name: 'names', type: 'varchar', length: 100 })
  names: string;

  @Column({ name: 'paternal_last_name', type: 'varchar', length: 100 })
  paternal_last_name: string;

  @Column({ name: 'maternal_last_name', type: 'varchar', length: 100 })
  maternal_last_name: string;

  @ManyToOne(() => DocumentType)
  @JoinColumn({ name: 'document_type_id' })
  documentType: DocumentType;

  @Column({ name: 'document_type_id', type: 'uuid' })
  documentTypeId: string;

  @Column({
    name: 'document_number',
    type: 'varchar',
    length: 20,
  })
  documentNumber: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @ManyToOne(() => Gender, {
    nullable: true,
  })
  @JoinColumn({ name: 'gender_id' })
  gender: Gender | null;

  @Column({ name: 'gender_id', type: 'uuid', nullable: true })
  genderId: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
