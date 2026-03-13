import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { AppPlatformId } from '../enums/app-platform-id.enum';
import { AppVersion } from './app-version.entity';

@Entity('app_platforms')
export class AppPlatform {
  @PrimaryColumn()
  id: AppPlatformId; // 'android' | 'ios' | 'web'

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text', name: 'store_url' })
  storeUrl: string | null;

  @OneToMany(() => AppVersion, (pv) => pv.appPlatform)
  versions: AppVersion[];
}
