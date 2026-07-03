import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPrice } from 'src/product/entities/product-price.entity';
import { Product } from 'src/product/entities/product.entity';
import { Repository } from 'typeorm';

export interface EnrollmentFormProduct {
  id: string;
  name: string;
  price: number;
}

@Injectable()
export class EnrollmentFormOptionsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductPrice)
    private readonly priceRepo: Repository<ProductPrice>,
  ) {}

  async getProducts(
    classId: string,
    academicYearId: string,
  ): Promise<EnrollmentFormProduct[]> {
    const products = await this.productRepo.find({
      where: {
        isActive: true,
        allowManualSale: true,
        allowSubscription: false,
      },
      relations: { prices: true },
    });

    const result: EnrollmentFormProduct[] = [];

    for (const product of products) {
      const price = this.resolvePrice(product.prices, classId, academicYearId);
      if (price === null) continue;
      result.push({ id: product.id, name: product.name, price });
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Price resolution hierarchy:
   * 1. Active price matching classId AND academicYearId
   * 2. Global active price (academicYearId null, classId null, enrollmentId null)
   * Returns null if neither exists.
   */
  private resolvePrice(
    prices: ProductPrice[],
    classId: string,
    academicYearId: string,
  ): number | null {
    const specific = prices.find(
      (p) =>
        p.isActive &&
        p.classId === classId &&
        p.academicYearId === academicYearId,
    );
    if (specific) return Number(specific.price);

    const global = prices.find(
      (p) =>
        p.isActive &&
        p.academicYearId === null &&
        p.classId === null &&
        p.enrollmentId === null,
    );
    if (global) return Number(global.price);

    return null;
  }
}
