import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateClassFeeDto } from '../dto/create-class-fee.dto';
import { UpdateClassFeeDto } from '../dto/update-class-fee.dto';
import { ClassFeeService } from '../services/class-fee.service';

@Auth([RoleId.ADMIN])
@Controller('class-fees')
export class ClassFeeController {
  constructor(private readonly svc: ClassFeeService) {}

  @Post()
  async create(@Body() dto: CreateClassFeeDto) {
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

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassFeeDto,
  ) {
    await this.svc.update(id, dto);
    return { success: true, message: 'Cuota actualizada correctamente' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.svc.remove(id);
    return { success: true, message: 'Cuota eliminada correctamente' };
  }

  @Post(':id/generate-debts')
  async generateDebts(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.svc.generateDebts(id);
    return {
      success: true,
      message: `Se generaron ${result.created} deudas. ${result.skipped} alumno(s) ya tenían esta deuda.`,
      ...result,
    };
  }
}
