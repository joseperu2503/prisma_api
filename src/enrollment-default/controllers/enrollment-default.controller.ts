import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateDefaultPlanDto } from '../dto/create-default-plan.dto';
import { CreateDefaultProductDto } from '../dto/create-default-product.dto';
import { EnrollmentDefaultService } from '../services/enrollment-default.service';

@Auth([RoleId.ADMIN])
@Controller('enrollment-defaults')
export class EnrollmentDefaultController {
  constructor(private readonly svc: EnrollmentDefaultService) {}

  // ── Products ──────────────────────────────────────────────────────────────

  @Get('products')
  findProducts(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('academicYearId', ParseUUIDPipe) academicYearId: string,
  ) {
    return this.svc.findProductsByClass(classId, academicYearId);
  }

  @Post('products')
  createProduct(@Body() dto: CreateDefaultProductDto) {
    return this.svc.createDefaultProduct(dto);
  }

  @Delete('products/:id')
  removeProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.removeDefaultProduct(id);
  }

  // ── Plans ─────────────────────────────────────────────────────────────────

  @Get('plans')
  findPlans(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('academicYearId', ParseUUIDPipe) academicYearId: string,
  ) {
    return this.svc.findPlansByClass(classId, academicYearId);
  }

  @Post('plans')
  createPlan(@Body() dto: CreateDefaultPlanDto) {
    return this.svc.createDefaultPlan(dto);
  }

  @Delete('plans/:id')
  removePlan(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.removeDefaultPlan(id);
  }
}
