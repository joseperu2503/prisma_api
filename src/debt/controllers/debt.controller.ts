import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { BulkSaveMatrixDto } from '../dto/bulk-save-matrix.dto';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { ListDebtDto } from '../dto/list-debt.dto';
import { DebtService } from '../services/debt.service';

@Auth([RoleId.ADMIN])
@Controller('debts')
export class DebtController {
  constructor(private readonly svc: DebtService) {}

  @Post()
  create(@Body() dto: CreateDebtDto) {
    return this.svc.create(dto);
  }

  @Post('bulk-save')
  bulkSave(@Body() dto: BulkSaveMatrixDto) {
    return this.svc.bulkSave(dto);
  }

  @Get()
  findAll(@Query() dto: ListDebtDto) {
    return this.svc.findAll(dto);
  }
}
