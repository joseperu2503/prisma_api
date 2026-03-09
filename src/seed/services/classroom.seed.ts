import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/classroom/entities/classroom.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClassroomSeed {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
  ) {}

  classrooms = [
    { name: 'Primer Grado A' },
    { name: 'Primer Grado B' },
    { name: 'Segundo Grado A' },
    { name: 'Segundo Grado B' },
    { name: 'Tercer Grado' },
    { name: 'Cuarto Grado' },
    { name: 'Quinto Grado' },
    { name: 'Sexto Grado' },
    { name: 'Primero Secundaria' },
    { name: 'Segundo Secundaria' },
    { name: 'Tercero Secundaria' },
  ];

  async run() {
    for (const classroom of this.classrooms) {
      await this.create(classroom);
    }
  }

  async create(params: { name: string }) {
    const { name } = params;

    const existingClassroom = await this.classroomRepository.findOne({
      where: { name },
    });

    if (existingClassroom) {
      return existingClassroom;
    } else {
      const newClassroom = this.classroomRepository.create(params);
      return await this.classroomRepository.save(newClassroom);
    }
  }
}
