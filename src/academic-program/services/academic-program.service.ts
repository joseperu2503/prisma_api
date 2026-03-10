import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAcademicProgramDto } from '../dto/create-academic-program.dto';
import { UpdateAcademicProgramDto } from '../dto/update-academic-program.dto';
import { AcademicProgram } from '../entities/academic-program.entity';

@Injectable()
export class AcademicProgramService {
  constructor(
    @InjectRepository(AcademicProgram)
    private readonly repo: Repository<AcademicProgram>,
  ) {}

  async create(dto: CreateAcademicProgramDto) {
    const existing = await this.repo.findOneBy({ name: dto.name });
    if (existing) {
      throw new ConflictException(`Ya existe un programa académico con el nombre "${dto.name}"`);
    }
    const program = this.repo.create({ isActive: true, ...dto });
    return this.repo.save(program);
  }

  async findAllPaginated(page: number, limit: number, search?: string) {
    const qb = this.repo
      .createQueryBuilder('ap')
      .orderBy('ap.name', 'ASC');

    if (search) {
      qb.where('LOWER(ap.name) LIKE :search', {
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

  async findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const program = await this.repo.findOneBy({ id });
    if (!program) {
      throw new NotFoundException(`Programa académico con ID ${id} no encontrado`);
    }
    return program;
  }

  async update(id: string, dto: UpdateAcademicProgramDto) {
    const program = await this.findOne(id);
    if (dto.name && dto.name.toLowerCase() !== program.name.toLowerCase()) {
      const existing = await this.repo.findOneBy({ name: dto.name });
      if (existing) {
        throw new ConflictException(`Ya existe un programa académico con el nombre "${dto.name}"`);
      }
    }
    Object.assign(program, dto);
    return this.repo.save(program);
  }

  async remove(id: string) {
    const program = await this.findOne(id);
    return this.repo.remove(program);
  }

  async toggleActive(id: string) {
    const program = await this.findOne(id);
    program.isActive = !program.isActive;
    return this.repo.save(program);
  }

  async findByName(name: string) {
    return this.repo.findOneBy({ name });
  }

  async findOrCreate(name: string) {
    const program = await this.findByName(name);
    if (program) return program;
    return this.repo.save(this.repo.create({ name, isActive: true }));
  }
}
