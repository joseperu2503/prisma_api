import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicProgram } from 'src/academic-program/entities/academic-program.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AcademicProgramSeed {
  constructor(
    @InjectRepository(AcademicProgram)
    private readonly repo: Repository<AcademicProgram>,
  ) {}

  programs = [
    { name: 'Segundo Grado' },
    { name: 'Tercer Grado' },
    { name: 'Cuarto Grado' },
    { name: 'Quinto Grado' },
    { name: 'Sexto Grado' },
    { name: 'Primer Año' },
    { name: 'Segundo Año' },
    { name: 'Intermedio' },
    { name: 'Pre' },
  ];

  async run() {
    for (const program of this.programs) {
      await this.create(program);
    }
  }

  async create(params: { name: string }) {
    const existing = await this.repo.findOne({ where: { name: params.name } });
    if (existing) return existing;
    const newProgram = this.repo.create({ ...params, isActive: true });
    return this.repo.save(newProgram);
  }
}
