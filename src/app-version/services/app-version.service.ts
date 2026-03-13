import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppVersionDto } from '../dto/create-app-version.dto';
import { UpdateAppVersionDto } from '../dto/update-app-version.dto';
import { AppPlatform } from '../entities/app-platform.entity';
import { AppVersion } from '../entities/app-version.entity';

@Injectable()
export class PlatformVersionService {
  constructor(
    @InjectRepository(AppVersion)
    private readonly versionRepo: Repository<AppVersion>,

    @InjectRepository(AppPlatform)
    private readonly typeRepo: Repository<AppPlatform>,
  ) {}

  findAllTypes(): Promise<AppPlatform[]> {
    return this.typeRepo.find();
  }

  async updateType(
    id: string,
    dto: { storeUrl?: string | null },
  ): Promise<AppPlatform> {
    const type = await this.typeRepo.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException(`AppPlatform '${id}' not found`);
    }
    Object.assign(type, dto);
    return this.typeRepo.save(type);
  }

  findAll(): Promise<AppVersion[]> {
    return this.versionRepo.find({
      order: { createdAt: 'DESC' },
      relations: { appPlatform: true },
    });
  }

  findByPlatform(appPlatformId: string): Promise<AppVersion[]> {
    return this.versionRepo.find({
      where: { appPlatformId },
      order: { createdAt: 'DESC' },
      relations: { appPlatform: true },
    });
  }

  async findOne(id: string): Promise<AppVersion> {
    const version = await this.versionRepo.findOne({ where: { id } });
    if (!version) {
      throw new NotFoundException(`AppVersion with id ${id} not found`);
    }
    return version;
  }

  async create(dto: CreateAppVersionDto): Promise<AppVersion> {
    const appPlatform = await this.typeRepo.findOne({
      where: { id: dto.appPlatformId },
    });
    if (!appPlatform) {
      throw new NotFoundException(
        `AppPlatform '${dto.appPlatformId}' not found`,
      );
    }
    const entity = this.versionRepo.create(dto);
    return this.versionRepo.save(entity);
  }

  async update(id: string, dto: UpdateAppVersionDto): Promise<AppVersion> {
    const version = await this.findOne(id);
    Object.assign(version, dto);
    return this.versionRepo.save(version);
  }

  async toggleActive(id: string): Promise<AppVersion> {
    const version = await this.findOne(id);
    version.isActive = !version.isActive;
    return this.versionRepo.save(version);
  }

  async remove(id: string): Promise<void> {
    const version = await this.findOne(id);
    await this.versionRepo.remove(version);
  }
}
