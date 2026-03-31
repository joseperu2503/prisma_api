import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebtConceptType } from '../entities/debt-concept-type.entity';
import { DebtStatus } from '../entities/debt-status.entity';
import { ChargeFrequency } from '../entities/charge-frequency.entity';
import { PaymentMethod } from '../entities/payment-method.entity';

@Injectable()
export class DebtCatalogService {
  constructor(
    @InjectRepository(DebtConceptType)
    private readonly conceptTypeRepo: Repository<DebtConceptType>,

    @InjectRepository(DebtStatus)
    private readonly statusRepo: Repository<DebtStatus>,

    @InjectRepository(ChargeFrequency)
    private readonly frequencyRepo: Repository<ChargeFrequency>,

    @InjectRepository(PaymentMethod)
    private readonly methodRepo: Repository<PaymentMethod>,
  ) {}

  getConceptTypes() { return this.conceptTypeRepo.find(); }
  getStatuses() { return this.statusRepo.find(); }
  getFrequencies() { return this.frequencyRepo.find(); }
  getPaymentMethods() { return this.methodRepo.find(); }
}
