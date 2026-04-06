import { Injectable } from '@nestjs/common';
import { Brackets, QueryRunner } from 'typeorm';
import { ProductPrice } from '../entities/product-price.entity';
import { ProductPriceTypeId } from '../enums/product-price-type-id.enum';

@Injectable()
export class ProductPriceService {
  async resolvePrice(
    productId: string,
    params: {
      classId?: string | null;
      academicYearId?: string | null;
      enrollmentId?: string | null;
    },
    runner: QueryRunner,
  ): Promise<number | null> {
    const qb = runner.manager
      .createQueryBuilder(ProductPrice, 'pp')
      .innerJoin('pp.priceType', 'pt')
      .select(['pp.price', 'pp.priceTypeId', 'pt.priority'])
      .where('pp.productId = :productId', { productId })
      .andWhere('pp.isActive = true')
      .andWhere(
        new Brackets((b) => {
          b.where('pp.priceTypeId = :global', {
            global: ProductPriceTypeId.GLOBAL,
          });
          if (params.classId && params.academicYearId) {
            b.orWhere(
              `pp.priceTypeId = :cay
               AND pp.classId = :classId
               AND pp.academicYearId = :academicYearId
              `,
              {
                cay: ProductPriceTypeId.CLASS_ACADEMIC_YEAR,
                classId: params.classId,
                academicYearId: params.academicYearId,
              },
            );
          }
          if (params.enrollmentId) {
            b.orWhere(
              'pp.priceTypeId = :enroll AND pp.enrollmentId = :enrollmentId',
              {
                enroll: ProductPriceTypeId.ENROLLMENT,
                enrollmentId: params.enrollmentId,
              },
            );
          }
        }),
      )
      .orderBy('pt.priority', 'ASC');

    const price = await qb.getOne();
    return price ? Number(price.price) : null;
  }
}
