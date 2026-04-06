import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPriceType } from 'src/product/entities/product-price-type.entity';
import { ProductPriceTypeId } from 'src/product/enums/product-price-type-id.enum';
import { Repository } from 'typeorm';

@Injectable()
export class ProductPriceTypeSeed {
  constructor(
    @InjectRepository(ProductPriceType)
    private readonly repo: Repository<ProductPriceType>,
  ) {}

  private readonly data: {
    id: ProductPriceTypeId;
    name: string;
    priority: number;
  }[] = [
    { id: ProductPriceTypeId.ENROLLMENT, name: 'Matrícula', priority: 1 },
    {
      id: ProductPriceTypeId.CLASS_ACADEMIC_YEAR,
      name: 'Clase/Año Académico',
      priority: 2,
    },
    { id: ProductPriceTypeId.GLOBAL, name: 'Global', priority: 3 },
  ];

  async run() {
    for (const item of this.data) {
      const existing = await this.repo.findOne({ where: { id: item.id } });
      if (existing) {
        existing.name = item.name;
        existing.priority = item.priority;
        await this.repo.save(existing);
      } else {
        await this.repo.save(this.repo.create(item));
      }
    }
  }
}
