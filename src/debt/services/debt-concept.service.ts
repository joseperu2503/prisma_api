import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDebtConceptDto } from '../dto/create-debt-concept.dto';
import { UpdateDebtConceptDto } from '../dto/update-debt-concept.dto';
import { DebtConcept } from '../entities/debt-concept.entity';

@Injectable()
export class DebtConceptService {
  constructor(
    @InjectRepository(DebtConcept)
    private readonly repo: Repository<DebtConcept>,
  ) {}

  async create(dto: CreateDebtConceptDto): Promise<DebtConcept> {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Ya existe un concepto con ese nombre');
    }
    const concept = this.repo.create(dto);
    return this.repo.save(concept);
  }

  async findAll(): Promise<DebtConcept[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<DebtConcept> {
    const concept = await this.repo.findOne({ where: { id } });
    if (!concept) throw new NotFoundException('Concepto no encontrado');
    return concept;
  }

  async update(id: string, dto: UpdateDebtConceptDto): Promise<DebtConcept> {
    const concept = await this.findOne(id);
    if (dto.name && dto.name !== concept.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('Ya existe un concepto con ese nombre');
    }
    Object.assign(concept, dto);
    return this.repo.save(concept);
  }

  async remove(id: string): Promise<void> {
    const concept = await this.findOne(id);
    await this.repo.remove(concept);
  }
}
