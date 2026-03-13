import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppPlatform } from 'src/app-version/entities/app-platform.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppPlatformSeed {
  constructor(
    @InjectRepository(AppPlatform)
    private readonly appPlatformRepo: Repository<AppPlatform>,
  ) {}

  private readonly appPlatforms = [
    { id: 'android', name: 'Android' },
    { id: 'ios', name: 'iOS' },
    { id: 'web', name: 'Web' },
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
