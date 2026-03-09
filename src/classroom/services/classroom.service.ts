import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYearService } from 'src/academic-year/services/academic-year.service';
import { Repository } from 'typeorm';
import { AssignClassroomToYearDto } from '../dto/assign-classroom-to-year.dto';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { ClassroomYear } from '../entities/classroom-year.entity';
import { Classroom } from '../entities/classroom.entity';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,

    @InjectRepository(ClassroomYear)
    private readonly classroomYearRepository: Repository<ClassroomYear>,

    private readonly academicYearService: AcademicYearService,
  ) {}

  async create(createClassroomDto: CreateClassroomDto) {
    const classroom = this.classroomRepository.create(createClassroomDto);
    return await this.classroomRepository.save(classroom);
  }

  async findAllPaginated(page: number, limit: number, search?: string) {
    const qb = this.classroomRepository
      .createQueryBuilder('c')
      .orderBy('c.name', 'ASC');

    if (search) {
      qb.where('LOWER(c.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
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

  async toggleActive(id: string) {
    const classroom = await this.findOne(id);
    classroom.isActive = !classroom.isActive;
    return await this.classroomRepository.save(classroom);
  }

  async assignToYear(assignDto: AssignClassroomToYearDto) {
    await this.academicYearService.findOne(assignDto.academicYearId);
    await this.findOne(assignDto.classroomId);

    const assignment = this.classroomYearRepository.create(assignDto);
    return await this.classroomYearRepository.save(assignment);
  }

  async findAssignmentsByYear(yearId: string) {
    return await this.classroomYearRepository.find({
      where: { academicYearId: yearId },
      relations: { classroom: true },
      order: { classroom: { name: 'ASC' } },
    });
  }

  async findByName(name: string) {
    return await this.classroomRepository.findOneBy({ name });
  }

  async findOrCreate(name: string) {
    let classroom = await this.findByName(name);
    if (!classroom) {
      classroom = await this.create({ name });
    }
    return classroom;
  }
}
