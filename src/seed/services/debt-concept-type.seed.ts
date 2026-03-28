import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DebtConceptType } from 'src/debt/entities/debt-concept-type.entity';
import { DebtConceptTypeId } from 'src/debt/enums/debt-concept-type-id.enum';
import { Repository } from 'typeorm';

@Injectable()
export class DebtConceptTypeSeed {
  constructor(
    @InjectRepository(DebtConceptType)
    private readonly repo: Repository<DebtConceptType>,
  ) {}

  private data = [
    { id: DebtConceptTypeId.ENROLLMENT, name: 'Matrícula' },
    { id: DebtConceptTypeId.TUITION, name: 'Pensión' },
    { id: DebtConceptTypeId.PRODUCT, name: 'Producto' },
    { id: DebtConceptTypeId.SERVICE, name: 'Servicio' },
    { id: DebtConceptTypeId.OTHER, name: 'Otro' },
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
