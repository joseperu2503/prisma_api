import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { PlanConfigurationService } from 'src/plan/services/plan-configuration.service';
import { ClassAcademicYearDto } from '../dto/class-academic-year.dto';
import { CreateDefaultPlanDto } from '../dto/create-default-plan.dto';
import { CreateDefaultProductDto } from '../dto/create-default-product.dto';
import { CreateClassPlanConfigurationDto } from '../dto/create-plan-configuration.dto';
import { UpdateClassPlanConfigurationDto } from '../dto/update-plan-configuration.dto';
import { ClassAcademicYearService } from '../services/class-academic-year.service';

@Auth([RoleId.ADMIN])
@Controller('class-academic-year')
export class ClassAcademicYearController {
  constructor(
    private readonly classAcademicYearSvc: ClassAcademicYearService,
    private readonly planConfigSvc: PlanConfigurationService,
  ) {}

  // ── Default Products ──────────────────────────────────────────────────────

  @Post('default-products/list')
  findDefaultProducts(@Body() dto: ClassAcademicYearDto) {
    return this.classAcademicYearSvc.findProductsByClass(
      dto.classId,
      dto.academicYearId,
    );
  }

  @Post('default-products/create')
  createDefaultProduct(@Body() dto: CreateDefaultProductDto) {
    return this.classAcademicYearSvc.createDefaultProduct(dto);
  }

  @Delete('default-products/:id/remove')
  removeDefaultProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.classAcademicYearSvc.removeDefaultProduct(id);
  }

  // ── Default Plans ─────────────────────────────────────────────────────────

  @Post('default-plans/list')
  findDefaultPlans(@Body() dto: ClassAcademicYearDto) {
    return this.classAcademicYearSvc.findPlansByClass(
      dto.classId,
      dto.academicYearId,
    );
  }

  @Post('default-plans/create')
  createDefaultPlan(@Body() dto: CreateDefaultPlanDto) {
    return this.classAcademicYearSvc.createDefaultPlan(dto);
  }

  @Delete('default-plans/:id/remove')
  removeDefaultPlan(@Param('id', ParseUUIDPipe) id: string) {
    return this.classAcademicYearSvc.removeDefaultPlan(id);
  }

  // ── Plan Configurations ───────────────────────────────────────────────────

  @Post('plan-configurations/list')
  findPlanConfigurations(@Body() dto: ClassAcademicYearDto) {
    return this.planConfigSvc.findByClass(dto.classId, dto.academicYearId);
  }

  @Post('plan-configurations/create')
  createPlanConfiguration(@Body() dto: CreateClassPlanConfigurationDto) {
    return this.planConfigSvc.create(dto.planId, {
      startDate: dto.startDate,
      endDate: dto.endDate,
      classId: dto.classId,
      academicYearId: dto.academicYearId,
      isActive: dto.isActive,
    });
  }

  @Patch('plan-configurations/:id/update')
  updatePlanConfiguration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassPlanConfigurationDto,
  ) {
    return this.planConfigSvc.update(id, dto);
  }
}
