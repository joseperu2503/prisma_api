import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PlanController } from './controllers/plan.controller';
import { PlanConfiguration } from './entities/plan-configuration.entity';
import { Plan } from './entities/plan.entity';
import { Subscription } from './entities/subscription.entity';
import { PlanConfigurationService } from './services/plan-configuration.service';
import { PlanService } from './services/plan.service';
import { SubscriptionService } from './services/subscription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, PlanConfiguration, Subscription]),
    AuthModule,
  ],
  controllers: [PlanController],
  providers: [PlanService, PlanConfigurationService, SubscriptionService],
})
export class PlanModule {}
