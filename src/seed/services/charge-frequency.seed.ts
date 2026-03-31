import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChargeFrequency } from 'src/debt/entities/charge-frequency.entity';
import { ChargeFrequencyId } from 'src/debt/enums/charge-frequency-id.enum';
import { Repository } from 'typeorm';

@Injectable()
export class ChargeFrequencySeed {
  constructor(
    @InjectRepository(ChargeFrequency)
    private readonly repo: Repository<ChargeFrequency>,
  ) {}

  private readonly data = [
    { id: ChargeFrequencyId.ONE_TIME, name: 'Una vez' },
    { id: ChargeFrequencyId.MONTHLY, name: 'Mensual' },
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
