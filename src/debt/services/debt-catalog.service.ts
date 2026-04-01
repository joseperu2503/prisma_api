import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargeFrequency } from '../entities/charge-frequency.entity';
import { DebtStatus } from '../entities/debt-status.entity';
import { PaymentMethod } from '../entities/payment-method.entity';

@Injectable()
export class DebtCatalogService {
  constructor(
    @InjectRepository(DebtStatus)
    private readonly statusRepo: Repository<DebtStatus>,

    @InjectRepository(ChargeFrequency)
    private readonly frequencyRepo: Repository<ChargeFrequency>,

    @InjectRepository(PaymentMethod)
    private readonly methodRepo: Repository<PaymentMethod>,
  ) {}

  getStatuses() {
    return this.statusRepo.find();
  }
  getFrequencies() {
    return this.frequencyRepo.find();
  }
  getPaymentMethods() {
    return this.methodRepo.find();
  }
}
