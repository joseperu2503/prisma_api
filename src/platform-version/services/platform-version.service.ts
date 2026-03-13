import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlatformVersionDto } from '../dto/create-platform-version.dto';
import { UpdatePlatformVersionDto } from '../dto/update-platform-version.dto';
import { PlatformType } from '../entities/platform-type.entity';
import { PlatformVersion } from '../entities/platform-version.entity';

@Injectable()
export class PlatformVersionService {
  constructor(
    @InjectRepository(PlatformVersion)
    private readonly versionRepo: Repository<PlatformVersion>,

    @InjectRepository(PlatformType)
    private readonly typeRepo: Repository<PlatformType>,
  ) {}

  findAllTypes(): Promise<PlatformType[]> {
    return this.typeRepo.find();
  }

  async updateType(id: string, dto: { storeUrl?: string | null }): Promise<PlatformType> {
    const type = await this.typeRepo.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException(`PlatformType '${id}' not found`);
    }
    Object.assign(type, dto);
    return this.typeRepo.save(type);
  }

  findAll(): Promise<PlatformVersion[]> {
    return this.versionRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  findByPlatform(platformTypeId: string): Promise<PlatformVersion[]> {
    return this.versionRepo.find({
      where: { platformTypeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PlatformVersion> {
    const version = await this.versionRepo.findOne({ where: { id } });
    if (!version) {
      throw new NotFoundException(`PlatformVersion with id ${id} not found`);
    }
    return version;
  }

  async create(dto: CreatePlatformVersionDto): Promise<PlatformVersion> {
    const platformType = await this.typeRepo.findOne({ where: { id: dto.platformTypeId } });
    if (!platformType) {
      throw new NotFoundException(`PlatformType '${dto.platformTypeId}' not found`);
    }
    const entity = this.versionRepo.create(dto);
    return this.versionRepo.save(entity);
  }

  async update(id: string, dto: UpdatePlatformVersionDto): Promise<PlatformVersion> {
    const version = await this.findOne(id);
    Object.assign(version, dto);
    return this.versionRepo.save(version);
  }

  async toggleActive(id: string): Promise<PlatformVersion> {
    const version = await this.findOne(id);
    version.isActive = !version.isActive;
    return this.versionRepo.save(version);
  }

  async remove(id: string): Promise<void> {
    const version = await this.findOne(id);
    await this.versionRepo.remove(version);
  }
}
