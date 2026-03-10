import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from '../entities/level.entity';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  findAll() {
    return this.levelRepository.find({ order: { name: 'ASC' } });
  }

  findOne(id: string) {
    return this.levelRepository.findOneBy({ id });
  }

  findByName(name: string) {
    return this.levelRepository.findOneBy({ name });
  }

  async findOrCreate(name: string) {
    const level = await this.findByName(name);
    if (level) return level;
    return this.levelRepository.save({ name });
  }
}
