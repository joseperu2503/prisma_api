import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreatePlanConfigurationDto } from '../dto/create-plan-configuration.dto';
import { UpdatePlanConfigurationDto } from '../dto/update-plan-configuration.dto';
import { PlanConfiguration } from '../entities/plan-configuration.entity';

@Injectable()
export class PlanConfigurationService {
  constructor(
    @InjectRepository(PlanConfiguration)
    private readonly configRepo: Repository<PlanConfiguration>,
  ) {}

  async create(
    planId: string,
    dto: CreatePlanConfigurationDto,
  ): Promise<PlanConfiguration> {
    const exists = await this.configRepo.findOne({
      where: {
        planId,
        classId: dto.classId ?? IsNull(),
        academicYearId: dto.academicYearId ?? IsNull(),
      },
    });

    if (exists) {
      throw new ConflictException(
        'Ya existe una configuración para este plan, clase y año académico',
      );
    }
    const config = this.configRepo.create({ ...dto, planId });
    return this.configRepo.save(config);
  }

  async findByPlan(planId: string): Promise<PlanConfiguration[]> {
    return this.configRepo.find({
      where: { planId },
      relations: {
        class: true,
        academicYear: true,
        subscriptions: { person: true },
      },
    });
  }

  async findByClass(
    classId: string,
    academicYearId?: string,
  ): Promise<PlanConfiguration[]> {
    const where: any = { classId };
    if (academicYearId) where.academicYearId = academicYearId;
    return this.configRepo.find({
      where,
      relations: {
        plan: { product: true },
        academicYear: true,
        subscriptions: { person: true },
      },
      order: { startDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PlanConfiguration> {
    const config = await this.configRepo.findOne({
      where: { id },
      relations: {
        class: true,
        academicYear: true,
        subscriptions: { person: true },
      },
    });

    if (!config) {
      throw new NotFoundException(`PlanConfiguration with id ${id} not found`);
    }

    return config;
  }

  async update(
    id: string,
    dto: UpdatePlanConfigurationDto,
  ): Promise<PlanConfiguration> {
    const config = await this.findOne(id);
    Object.assign(config, dto);
    return this.configRepo.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.configRepo.remove(config);
  }
}
