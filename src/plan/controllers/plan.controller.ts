import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreatePlanConfigurationDto } from '../dto/create-plan-configuration.dto';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { ListPlansDto } from '../dto/list-plans.dto';
import { UpdatePlanConfigurationDto } from '../dto/update-plan-configuration.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { PlanConfigurationService } from '../services/plan-configuration.service';
import { PlanService } from '../services/plan.service';
import { SubscriptionService } from '../services/subscription.service';

@Auth([RoleId.ADMIN])
@Controller('plans')
export class PlanController {
  constructor(
    private readonly planSvc: PlanService,
    private readonly configSvc: PlanConfigurationService,
    private readonly subscriptionSvc: SubscriptionService,
  ) {}

  @Post()
  create(@Body() dto: CreatePlanDto) {
    return this.planSvc.create(dto);
  }

  @Post('list')
  findAll(@Body() dto: ListPlansDto) {
    return this.planSvc.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planSvc.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.planSvc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planSvc.remove(id);
  }

  @Post(':id/configurations')
  createConfig(
    @Param('id') planId: string,
    @Body() dto: CreatePlanConfigurationDto,
  ) {
    return this.configSvc.create(planId, dto);
  }

  @Get(':id/configurations')
  findConfigs(@Param('id') planId: string) {
    return this.configSvc.findByPlan(planId);
  }

  @Get('configurations/by-class/:classId')
  findConfigsByClass(
    @Param('classId') classId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.configSvc.findByClass(classId, academicYearId);
  }

  @Patch('configurations/:configId')
  updateConfig(
    @Param('configId') id: string,
    @Body() dto: UpdatePlanConfigurationDto,
  ) {
    return this.configSvc.update(id, dto);
  }

  @Delete('configurations/:configId')
  removeConfig(@Param('configId') id: string) {
    return this.configSvc.remove(id);
  }

  @Post('configurations/:configId/subscriptions')
  createSubscription(
    @Param('configId') configId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionSvc.create(configId, dto);
  }

  @Get('configurations/:configId/subscriptions')
  findSubscriptions(@Param('configId') configId: string) {
    return this.subscriptionSvc.findByConfiguration(configId);
  }

  @Get('subscriptions/:subId')
  findSubscription(@Param('subId') id: string) {
    return this.subscriptionSvc.findOne(id);
  }

  @Patch('subscriptions/:subId/cancel')
  cancelSubscription(@Param('subId') id: string) {
    return this.subscriptionSvc.cancel(id);
  }
}
