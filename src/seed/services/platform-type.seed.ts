import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlatformType } from 'src/platform-version/entities/platform-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlatformTypeSeed {
  constructor(
    @InjectRepository(PlatformType)
    private readonly platformTypeRepo: Repository<PlatformType>,
  ) {}

  private readonly platformTypes = [
    { id: 'android', name: 'Android' },
    { id: 'ios', name: 'iOS' },
    { id: 'web', name: 'Web' },
  ];

  async run() {
    for (const pt of this.platformTypes) {
      const exists = await this.platformTypeRepo.findOne({
        where: { id: pt.id },
      });
      if (!exists) {
        await this.platformTypeRepo.save(
          this.platformTypeRepo.create({ id: pt.id, name: pt.name }),
        );
      } else {
        exists.name = pt.name;
        await this.platformTypeRepo.save(exists);
      }
    }
  }
}
