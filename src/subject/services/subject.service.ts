import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { ListSubjectDto } from '../dto/list-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { Subject } from '../entities/subject.entity';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly repo: Repository<Subject>,
  ) {}

  async create(dto: CreateSubjectDto) {
    const existing = await this.repo.findOneBy({ name: dto.name });
    if (existing) {
      throw new ConflictException(
        `Ya existe un curso con el nombre "${dto.name}"`,
      );
    }
    const record = this.repo.create({ isActive: true, ...dto });
    return this.repo.save(record);
  }

  async findAll(params: ListSubjectDto) {
    const { pagination, search } = params;
    const page = pagination?.page;
    const limit = pagination?.limit;

    const qb = this.repo.createQueryBuilder('s').orderBy('s.name', 'ASC');

    if (search) {
      qb.where('LOWER(s.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    let data: Subject[];
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

    return {
      data,
      total,
      pagination: page && limit ? { page, limit } : undefined,
    };
  }

  async findAllUnpaginated() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const record = await this.repo.findOneBy({ id });
    if (!record) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }
    return record;
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const record = await this.findOne(id);
    if (dto.name && dto.name.toLowerCase() !== record.name.toLowerCase()) {
      const existing = await this.repo.findOneBy({ name: dto.name });
      if (existing) {
        throw new ConflictException(
          `Ya existe un curso con el nombre "${dto.name}"`,
        );
      }
    }
    Object.assign(record, dto);
    return this.repo.save(record);
  }

  async remove(id: string) {
    const record = await this.findOne(id);
    return this.repo.remove(record);
  }

  async toggleActive(id: string) {
    const record = await this.findOne(id);
    record.isActive = !record.isActive;
    return this.repo.save(record);
  }
}
