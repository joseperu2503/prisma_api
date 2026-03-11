import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from 'src/class/entities/class.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClassSeed {
  constructor(
    @InjectRepository(Class)
    private readonly repo: Repository<Class>,
  ) {}

  classes = [
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
    for (const item of this.classes) {
      await this.create(item);
    }
  }

  async create(params: { name: string }) {
    const existing = await this.repo.findOne({ where: { name: params.name } });
    if (existing) return existing;
    const record = this.repo.create({ ...params, isActive: true });
    return this.repo.save(record);
  }
}
