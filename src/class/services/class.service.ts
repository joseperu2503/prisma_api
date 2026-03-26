import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassDto } from '../dto/create-class.dto';
import { ListClassDto } from '../dto/list-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { Class } from '../entities/class.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly repo: Repository<Class>,
  ) {}

  async create(dto: CreateClassDto) {
    const existing = await this.repo.findOneBy({ name: dto.name });
    if (existing) {
      throw new ConflictException(
        `Ya existe una clase con el nombre "${dto.name}"`,
      );
    }
    const record = this.repo.create({ isActive: true, ...dto });
    return this.repo.save(record);
  }

  async findAll(params: ListClassDto) {
    const { pagination, search } = params;
    const page = pagination?.page;
    const limit = pagination?.limit;

    const qb = this.repo.createQueryBuilder('c').orderBy('c.name', 'ASC');

    if (search) {
      qb.where('LOWER(c.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    let data: Class[];
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

  async findAllActive() {
    return this.repo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const record = await this.repo.findOneBy({ id });
    if (!record) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }
    return record;
  }

  async update(id: string, dto: UpdateClassDto) {
    const record = await this.findOne(id);
    if (dto.name && dto.name.toLowerCase() !== record.name.toLowerCase()) {
      const existing = await this.repo.findOneBy({ name: dto.name });
      if (existing) {
        throw new ConflictException(
          `Ya existe una clase con el nombre "${dto.name}"`,
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

  async findByName(name: string) {
    return this.repo.findOneBy({ name });
  }

  async findOrCreate(name: string) {
    const record = await this.findByName(name);
    if (record) return record;
    return this.repo.save(this.repo.create({ name, isActive: true }));
  }
}
