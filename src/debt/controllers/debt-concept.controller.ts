import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateDebtConceptDto } from '../dto/create-debt-concept.dto';
import { UpdateDebtConceptDto } from '../dto/update-debt-concept.dto';
import { DebtConceptService } from '../services/debt-concept.service';

@Auth([RoleId.ADMIN])
@Controller('debt-concepts')
export class DebtConceptController {
  constructor(private readonly svc: DebtConceptService) {}

  @Post()
  async create(@Body() dto: CreateDebtConceptDto) {
    await this.svc.create(dto);
    return { success: true, message: 'Concepto creado correctamente' };
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDebtConceptDto,
  ) {
    await this.svc.update(id, dto);
    return { success: true, message: 'Concepto actualizado correctamente' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.svc.remove(id);
    return { success: true, message: 'Concepto eliminado correctamente' };
  }
}
