import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { Classroom } from '../entities/classroom.entity';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
  ) {}

  async create(createClassroomDto: CreateClassroomDto) {
    const classroom = this.classroomRepository.create(createClassroomDto);
    return await this.classroomRepository.save(classroom);
  }

  async findAll() {
    return await this.classroomRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const classroom = await this.classroomRepository.findOneBy({ id });
    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }
    return classroom;
  }

  async update(id: string, updateClassroomDto: UpdateClassroomDto) {
    const classroom = await this.findOne(id);
    const updatedClassroom = this.classroomRepository.merge(
      classroom,
      updateClassroomDto,
    );
    return await this.classroomRepository.save(updatedClassroom);
  }

  async remove(id: string) {
    const classroom = await this.findOne(id);
    return await this.classroomRepository.remove(classroom);
  }
}
