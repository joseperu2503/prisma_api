import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { DebtCatalogService } from '../services/debt-catalog.service';

@Auth([RoleId.ADMIN])
@Controller()
export class DebtCatalogController {
  constructor(private readonly svc: DebtCatalogService) {}

  @Get('debt-statuses')
  getStatuses() {
    return this.svc.getStatuses();
  }

  @Get('payment-methods')
  getPaymentMethods() {
    return this.svc.getPaymentMethods();
  }
}
