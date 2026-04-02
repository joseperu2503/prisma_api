import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { ListPlansDto } from '../dto/list-plans.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { PlanConfiguration } from '../entities/plan-configuration.entity';
import { Plan } from '../entities/plan.entity';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,

    @InjectRepository(PlanConfiguration)
    private readonly configRepo: Repository<PlanConfiguration>,

    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async create(dto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepo.create(dto);
    return this.planRepo.save(plan);
  }

  async findAll(dto: ListPlansDto): Promise<Plan[]> {
    const qb = this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.product', 'product');

    if (dto.search) {
      qb.andWhere('plan.name ILIKE :search', { search: `%${dto.search}%` });
    }

    if (dto.isActive !== undefined) {
      qb.andWhere('plan.isActive = :isActive', { isActive: dto.isActive });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: {
        product: true,
        configurations: {
          class: true,
          academicYear: true,
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }

    return plan;
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepo.remove(plan);
  }
}
