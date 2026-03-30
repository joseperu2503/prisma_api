import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IgvAffectationType } from 'src/product/entities/igv-affectation-type.entity';
import { IgvAffectationTypeId } from 'src/product/enums/igv-affectation-type-id.enum';
import { Repository } from 'typeorm';

@Injectable()
export class IgvAffectationTypeSeed {
  constructor(
    @InjectRepository(IgvAffectationType)
    private readonly repo: Repository<IgvAffectationType>,
  ) {}

  private readonly data: { id: IgvAffectationTypeId; name: string }[] = [
    { id: IgvAffectationTypeId.GRAVADO_ONEROSA,          name: 'Gravado – Operación Onerosa' },
    { id: IgvAffectationTypeId.GRAVADO_RETIRO,           name: 'Gravado – Retiro por premio' },
    { id: IgvAffectationTypeId.GRAVADO_RETIRO_DONACION,  name: 'Gravado – Retiro por donación' },
    { id: IgvAffectationTypeId.GRAVADO_RETIRO_PROPIEDAD, name: 'Gravado – Retiro a favor de trabajadores' },
    { id: IgvAffectationTypeId.GRAVADO_IVAP,             name: 'Gravado – IVAP' },
    { id: IgvAffectationTypeId.EXONERADO_ONEROSA,        name: 'Exonerado – Operación Onerosa' },
    { id: IgvAffectationTypeId.EXONERADO_TRANSFERENCIA,  name: 'Exonerado – Transferencia gratuita' },
    { id: IgvAffectationTypeId.INAFECTO_ONEROSA,         name: 'Inafecto – Operación Onerosa' },
    { id: IgvAffectationTypeId.INAFECTO_RETIRO,          name: 'Inafecto – Retiro por bonificación' },
    { id: IgvAffectationTypeId.INAFECTO_RETIRO2,         name: 'Inafecto – Retiro' },
    { id: IgvAffectationTypeId.INAFECTO_RETIRO3,         name: 'Inafecto – Retiro por muestras' },
    { id: IgvAffectationTypeId.INAFECTO_RETIRO4,         name: 'Inafecto – Retiro por convenio colectivo' },
    { id: IgvAffectationTypeId.INAFECTO_RETIRO5,         name: 'Inafecto – Retiro por premio' },
    { id: IgvAffectationTypeId.INAFECTO_RETIRO6,         name: 'Inafecto – Retiro por publicidad' },
    { id: IgvAffectationTypeId.EXPORTACION,              name: 'Exportación de bienes o servicios' },
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
