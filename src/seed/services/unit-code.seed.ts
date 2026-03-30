import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnitCode } from 'src/product/entities/unit-code.entity';
import { UnitCodeId } from 'src/product/enums/unit-code-id.enum';
import { Repository } from 'typeorm';

@Injectable()
export class UnitCodeSeed {
  constructor(
    @InjectRepository(UnitCode)
    private readonly repo: Repository<UnitCode>,
  ) {}

  private readonly data: { id: UnitCodeId; name: string; description: string }[] = [
    { id: UnitCodeId.NIU, name: 'Unidad', description: 'NIU – Unidad (bienes)' },
    { id: UnitCodeId.ZZ,  name: 'Servicio', description: 'ZZ – Unidad de servicio' },
    { id: UnitCodeId.KGM, name: 'Kilogramo', description: 'KGM – Kilogramo' },
    { id: UnitCodeId.LTR, name: 'Litro', description: 'LTR – Litro' },
    { id: UnitCodeId.MTR, name: 'Metro', description: 'MTR – Metro' },
    { id: UnitCodeId.MTK, name: 'Metro cuadrado', description: 'MTK – Metro cuadrado' },
    { id: UnitCodeId.HUR, name: 'Hora', description: 'HUR – Hora' },
    { id: UnitCodeId.DAY, name: 'Día', description: 'DAY – Día' },
    { id: UnitCodeId.MON, name: 'Mes', description: 'MON – Mes' },
  ];

  async run() {
    for (const item of this.data) {
      const existing = await this.repo.findOne({ where: { id: item.id } });
      if (existing) {
        existing.name = item.name;
        existing.description = item.description;
        await this.repo.save(existing);
      } else {
        await this.repo.save(this.repo.create(item));
      }
    }
  }
}
