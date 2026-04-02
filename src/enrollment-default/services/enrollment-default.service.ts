import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDefaultPlanDto } from '../dto/create-default-plan.dto';
import { CreateDefaultProductDto } from '../dto/create-default-product.dto';
import { DefaultPlan } from '../entities/default-plan.entity';
import { DefaultProduct } from '../entities/default-product.entity';

@Injectable()
export class EnrollmentDefaultService {
  constructor(
    @InjectRepository(DefaultProduct)
    private readonly defaultProductRepo: Repository<DefaultProduct>,

    @InjectRepository(DefaultPlan)
    private readonly defaultPlanRepo: Repository<DefaultPlan>,
  ) {}

  // ── Default Products ──────────────────────────────────────────────────────

  async findProductsByClass(classId: string, academicYearId: string): Promise<DefaultProduct[]> {
    return this.defaultProductRepo.find({
      where: { classId, academicYearId },
      relations: { product: true },
      order: { createdAt: 'ASC' },
    });
  }

  async createDefaultProduct(dto: CreateDefaultProductDto): Promise<DefaultProduct> {
    const existing = await this.defaultProductRepo.findOne({
      where: { classId: dto.classId, academicYearId: dto.academicYearId, productId: dto.productId },
    });
    if (existing) throw new ConflictException('Este producto ya está en los defaults');

    const entity = this.defaultProductRepo.create(dto);
    return this.defaultProductRepo.save(entity);
  }

  async removeDefaultProduct(id: string): Promise<void> {
    const entity = await this.defaultProductRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`DefaultProduct with id ${id} not found`);
    await this.defaultProductRepo.remove(entity);
  }

  // ── Default Plans ─────────────────────────────────────────────────────────

  async findPlansByClass(classId: string, academicYearId: string): Promise<DefaultPlan[]> {
    return this.defaultPlanRepo.find({
      where: { classId, academicYearId },
      relations: { planConfiguration: { plan: true } },
      order: { createdAt: 'ASC' },
    });
  }

  async createDefaultPlan(dto: CreateDefaultPlanDto): Promise<DefaultPlan> {
    const existing = await this.defaultPlanRepo.findOne({
      where: {
        classId: dto.classId,
        academicYearId: dto.academicYearId,
        planConfigurationId: dto.planConfigurationId,
      },
    });
    if (existing) throw new ConflictException('Este plan ya está en los defaults');

    const entity = this.defaultPlanRepo.create(dto);
    return this.defaultPlanRepo.save(entity);
  }

  async removeDefaultPlan(id: string): Promise<void> {
    const entity = await this.defaultPlanRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`DefaultPlan with id ${id} not found`);
    await this.defaultPlanRepo.remove(entity);
  }
}
