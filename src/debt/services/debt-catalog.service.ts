import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebtStatus } from '../entities/debt-status.entity';
import { PaymentMethod } from '../entities/payment-method.entity';

@Injectable()
export class DebtCatalogService {
  constructor(
    @InjectRepository(DebtStatus)
    private readonly statusRepo: Repository<DebtStatus>,

    @InjectRepository(PaymentMethod)
    private readonly methodRepo: Repository<PaymentMethod>,
  ) {}

  getStatuses() {
    return this.statusRepo.find();
  }

  getPaymentMethods() {
    return this.methodRepo.find();
  }
}
