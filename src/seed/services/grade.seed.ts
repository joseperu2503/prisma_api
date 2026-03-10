import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Grade } from 'src/grade/entities/grade.entity';
import { Level } from 'src/level/entities/level.entity';
import { Repository } from 'typeorm';

const GRADES: { name: string; levelName: string }[] = [
  { name: 'Primer Grado A', levelName: 'Primaria' },
  { name: 'Primer Grado B', levelName: 'Primaria' },
  { name: 'Segundo Grado A', levelName: 'Primaria' },
  { name: 'Segundo Grado B', levelName: 'Primaria' },
  { name: 'Tercer Grado', levelName: 'Primaria' },
  { name: 'Cuarto Grado', levelName: 'Primaria' },
  { name: 'Quinto Grado', levelName: 'Primaria' },
  { name: 'Sexto Grado', levelName: 'Primaria' },
  { name: 'Primero Secundaria', levelName: 'Secundaria' },
  { name: 'Segundo Secundaria', levelName: 'Secundaria' },
  { name: 'Tercero Secundaria', levelName: 'Secundaria' },
];

@Injectable()
export class GradeSeed {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,

    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  async run() {
    for (const grade of GRADES) {
      await this.create(grade);
    }
  }

  async create(params: { name: string; levelName: string }) {
    const existing = await this.gradeRepository.findOne({
      where: { name: params.name },
    });
    if (existing) return existing;

    const level = await this.levelRepository.findOne({
      where: { name: params.levelName },
    });

    if (!level) {
      throw new Error(
        `Level "${params.levelName}" not found. Run level seed first.`,
      );
    }

    const newGrade = this.gradeRepository.create({
      name: params.name,
      levelId: level.id,
    });
    return await this.gradeRepository.save(newGrade);
  }
}
