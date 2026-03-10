import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/level/entities/level.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LevelSeed {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  levels = [
    { name: 'Inicial' },
    { name: 'Primaria' },
    { name: 'Secundaria' },
  ];

  async run() {
    for (const level of this.levels) {
      await this.create(level);
    }
  }

  async create(params: { name: string }) {
    const existing = await this.levelRepository.findOne({
      where: { name: params.name },
    });
    if (existing) return existing;

    const newLevel = this.levelRepository.create(params);
    return await this.levelRepository.save(newLevel);
  }
}
