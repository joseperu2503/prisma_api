import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeeFrequency } from 'src/debt/entities/fee-frequency.entity';
import { FeeFrequencyId } from 'src/debt/enums/fee-frequency-id.enum';
import { Repository } from 'typeorm';

@Injectable()
export class FeeFrequencySeed {
  constructor(
    @InjectRepository(FeeFrequency)
    private readonly repo: Repository<FeeFrequency>,
  ) {}

  private readonly data = [
    { id: FeeFrequencyId.ONE_TIME, name: 'Una vez' },
    { id: FeeFrequencyId.MONTHLY, name: 'Mensual' },
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
