import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from 'src/debt/entities/payment-method.entity';
import { PaymentMethodId } from 'src/debt/enums/payment-method-id.enum';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentMethodSeed {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly repo: Repository<PaymentMethod>,
  ) {}

  private readonly data = [
    { id: PaymentMethodId.CASH, name: 'Efectivo' },
    { id: PaymentMethodId.TRANSFER, name: 'Transferencia' },
    { id: PaymentMethodId.CARD, name: 'Tarjeta' },
    { id: PaymentMethodId.OTHER, name: 'Otro' },
  ];

  async run() {
    for (const item of this.data) {
      const existing = await this.repo.findOne({ where: { id: item.id } });
      if (existing) {
        existing.name = item.name;
        await this.repo.save(existing);
      } else {
        await this.repo.save(this.repo.create(item));
      }
    }
  }
}
