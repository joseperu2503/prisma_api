import { Controller } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { PaymentService } from '../services/payment.service';

@Auth([RoleId.ADMIN])
@Controller('debts/:debtId/payments')
export class PaymentController {
  constructor(private readonly svc: PaymentService) {}
}
