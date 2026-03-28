import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DebtStatusId } from 'src/debt/enums/debt-status-id.enum';
import { DebtStatus } from 'src/debt/entities/debt-status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DebtStatusSeed {
  constructor(
    @InjectRepository(DebtStatus)
    private readonly repo: Repository<DebtStatus>,
  ) {}

  private readonly data = [
    { id: DebtStatusId.PENDING, name: 'Pendiente' },
    { id: DebtStatusId.PARTIAL, name: 'Parcial' },
    { id: DebtStatusId.PAID, name: 'Pagado' },
    { id: DebtStatusId.CANCELLED, name: 'Cancelado' },
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
