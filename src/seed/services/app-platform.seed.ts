import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppPlatform } from 'src/app-version/entities/app-platform.entity';
import { AppPlatformId } from 'src/app-version/enums/app-platform-id.enum';
import { Repository } from 'typeorm';

@Injectable()
export class AppPlatformSeed {
  constructor(
    @InjectRepository(AppPlatform)
    private readonly appPlatformRepo: Repository<AppPlatform>,
  ) {}

  private readonly appPlatforms = [
    { id: AppPlatformId.ANDROID, name: 'Android' },
    { id: AppPlatformId.IOS, name: 'iOS' },
    { id: AppPlatformId.WEB, name: 'Web' },
  ];

  async run() {
    for (const pt of this.appPlatforms) {
      const exists = await this.appPlatformRepo.findOne({
        where: { id: pt.id },
      });
      if (!exists) {
        await this.appPlatformRepo.save(
          this.appPlatformRepo.create({ id: pt.id, name: pt.name }),
        );
      } else {
        exists.name = pt.name;
        await this.appPlatformRepo.save(exists);
      }
    }
  }
}
