import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateClassChargeDto } from '../dto/create-class-charge.dto';
import { UpdateClassChargeDto } from '../dto/update-class-charge.dto';
import { ClassChargeService } from '../services/class-charge.service';

@Auth([RoleId.ADMIN])
@Controller('class-charges')
export class ClassChargeController {
  constructor(private readonly svc: ClassChargeService) {}

  @Post()
  async create(@Body() dto: CreateClassChargeDto) {
    await this.svc.create(dto);
    return { success: true, message: 'Cuota registrada correctamente' };
  }

  @Get()
  findByClass(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('academicYearId', ParseUUIDPipe) academicYearId: string,
  ) {
    return this.svc.findByClass(classId, academicYearId);
  }

  @Get('enrolled-students')
  getEnrolledStudents(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('academicYearId', ParseUUIDPipe) academicYearId: string,
  ) {
    return this.svc.getEnrolledStudents(classId, academicYearId);
  }

  @Get('matrix')
  getMatrix(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('academicYearId', ParseUUIDPipe) academicYearId: string,
  ) {
    return this.svc.getMatrix(classId, academicYearId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassChargeDto,
  ) {
    await this.svc.update(id, dto);
    return { success: true, message: 'Cobro actualizado correctamente' };
  }

  @Post(':id/generate-debts')
  async generateDebts(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.svc.generateDebts(id);
    return {
      success: true,
      message: `Se generaron ${result.created} deudas nuevas. ${result.skipped} deuda(s) ya existían.`,
      ...result,
    };
  }
}
