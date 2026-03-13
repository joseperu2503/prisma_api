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
import { AppPlatform } from './app-platform.entity';

@Entity('app_versions')
@Unique(['appPlatformId', 'version', 'build'])
export class AppVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'app_platform_id' })
  appPlatformId: string;

  @ManyToOne(() => AppPlatform, (ap) => ap.versions)
  @JoinColumn({ name: 'app_platform_id' })
  appPlatform: AppPlatform;

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
