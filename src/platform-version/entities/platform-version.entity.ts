import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PlatformType } from './platform-type.entity';

@Entity('platform_versions')
@Unique(['platformTypeId', 'version', 'build'])
export class PlatformVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'platform_type_id' })
  platformTypeId: string;

  @ManyToOne(() => PlatformType, (pt) => pt.versions, { eager: true })
  @JoinColumn({ name: 'platform_type_id' })
  platformType: PlatformType;

  @Column()
  version: string;

  @Column({ nullable: true })
  build: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
