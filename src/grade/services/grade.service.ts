import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYearService } from 'src/academic-year/services/academic-year.service';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { DataSource, Repository } from 'typeorm';
import { AssignGradeToYearDto } from '../dto/assign-grade-to-year.dto';
import { CreateGradeDto } from '../dto/create-grade.dto';
import { ListGradesDto } from '../dto/list-grades.dto';
import { UpdateGradeDto } from '../dto/update-grade.dto';
import { GradeYear } from '../entities/grade-year.entity';
import { Grade } from '../entities/grade.entity';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,

    @InjectRepository(GradeYear)
    private readonly gradeYearRepository: Repository<GradeYear>,

    private readonly academicYearService: AcademicYearService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createGradeDto: CreateGradeDto) {
    const existing = await this.gradeRepository.findOneBy({
      name: createGradeDto.name,
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un grado con el nombre "${createGradeDto.name}"`,
      );
    }
    const grade = this.gradeRepository.create(createGradeDto);
    return await this.gradeRepository.save(grade);
  }

  async findAll(params: ListGradesDto) {
    const pagination = params.pagination;
    const search = params.search;

    const page = pagination?.page;
    const limit = pagination?.limit;

    const qb = this.gradeRepository
      .createQueryBuilder('g')
      .select(['g.id', 'g.name', 'g.isActive'])
      .leftJoin('g.level', 'l')
      .addSelect(['l.id', 'l.name'])
      .orderBy('l.name', 'ASC')
      .addOrderBy('g.name', 'ASC');

    if (search) {
      qb.where('LOWER(g.name) LIKE :search OR LOWER(l.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    let data: Grade[];
    let total: number;

    if (page && limit) {
      total = await qb.getCount();
      data = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
    } else {
      data = await qb.getMany();
      total = data.length;
    }

    return { data, total, pagination: { page, limit } };
  }

  async findOne(id: string) {
    const grade = await this.gradeRepository.findOne({
      where: { id },
      relations: { level: true },
    });
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  async update(id: string, updateGradeDto: UpdateGradeDto) {
    const grade = await this.findOne(id);
    if (updateGradeDto.name && updateGradeDto.name !== grade.name) {
      const duplicate = await this.gradeRepository.findOneBy({
        name: updateGradeDto.name,
      });
      if (duplicate) {
        throw new ConflictException(
          `Ya existe un grado con el nombre "${updateGradeDto.name}"`,
        );
      }
    }
    const updatedGrade = this.gradeRepository.merge(grade, updateGradeDto);
    return await this.gradeRepository.save(updatedGrade);
  }

  async remove(id: string) {
    const grade = await this.findOne(id);
    const enrollmentCount = await this.dataSource
      .getRepository(Enrollment)
      .countBy({ gradeId: id });
    if (enrollmentCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el grado porque tiene ${enrollmentCount} matrícula(s) asociada(s)`,
      );
    }
    return await this.gradeRepository.remove(grade);
  }

  async toggleActive(id: string) {
    const grade = await this.findOne(id);
    grade.isActive = !grade.isActive;
    return await this.gradeRepository.save(grade);
  }

  async assignToYear(assignDto: AssignGradeToYearDto) {
    await this.academicYearService.findOne(assignDto.academicYearId);
    await this.findOne(assignDto.gradeId);

    const assignment = this.gradeYearRepository.create(assignDto);
    return await this.gradeYearRepository.save(assignment);
  }

  async findAssignmentsByYear(yearId: string) {
    return await this.gradeYearRepository.find({
      where: { academicYearId: yearId },
      relations: { grade: { level: true } },
      order: { grade: { name: 'ASC' } },
    });
  }

  async findByName(name: string) {
    return await this.gradeRepository.findOneBy({ name });
  }

  async findOrCreate(name: string, levelId: string) {
    let grade = await this.findByName(name);
    if (!grade) {
      grade = await this.create({ name, levelId });
    }
    return grade;
  }
}
