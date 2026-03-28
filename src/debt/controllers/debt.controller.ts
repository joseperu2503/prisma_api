import { Controller, Get, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { ListDebtDto } from '../dto/list-debt.dto';
import { DebtService } from '../services/debt.service';

@Auth([RoleId.ADMIN])
@Controller('debts')
export class DebtController {
  constructor(private readonly svc: DebtService) {}

  @Get()
  findAll(@Query() dto: ListDebtDto) {
    return this.svc.findAll(dto);
  }
}
