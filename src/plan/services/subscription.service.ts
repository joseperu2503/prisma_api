import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { PlanConfiguration } from '../entities/plan-configuration.entity';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,

    @InjectRepository(PlanConfiguration)
    private readonly configRepo: Repository<PlanConfiguration>,
  ) {}

  async create(planConfigurationId: string, dto: CreateSubscriptionDto): Promise<Subscription> {
    const config = await this.configRepo.findOne({ where: { id: planConfigurationId } });

    if (!config) {
      throw new NotFoundException(`PlanConfiguration with id ${planConfigurationId} not found`);
    }

    const subscription = this.subscriptionRepo.create({
      ...dto,
      planConfigurationId,
      statusId: 'ACTIVE',
      enrollmentId: dto.enrollmentId ?? null,
      notes: dto.notes ?? null,
    });

    return this.subscriptionRepo.save(subscription);
  }

  async findByConfiguration(planConfigurationId: string): Promise<Subscription[]> {
    return this.subscriptionRepo.find({
      where: { planConfigurationId },
      relations: { person: true, enrollment: true },
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id },
      relations: {
        person: true,
        planConfiguration: { plan: { product: true } },
        enrollment: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with id ${id} not found`);
    }

    return subscription;
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.statusId = 'CANCELLED';
    return this.subscriptionRepo.save(subscription);
  }
}
