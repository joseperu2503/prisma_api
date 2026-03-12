import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { PlatformVersion } from './platform-version.entity';

@Entity('platform_types')
export class PlatformType {
  @PrimaryColumn()
  id: string; // 'android' | 'ios' | 'web'

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text', name: 'store_url' })
  storeUrl: string | null;

  @OneToMany(() => PlatformVersion, (pv) => pv.platformType)
  versions: PlatformVersion[];
}
