import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, DataSource, IsNull, QueryRunner } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductPrice } from '../entities/product-price.entity';
import { ProductPriceTypeId } from '../enums/product-price-type-id.enum';

@Injectable()
export class ProductPriceService {
  constructor(private readonly dataSource: DataSource) {}

  private async create(
    params: {
      productId: string;
      price: number;
      priceTypeId: ProductPriceTypeId;
      academicYearId: string | null;
      classId: string | null;
      enrollmentId: string | null;
      personId: string | null;
      isActive?: boolean;
    },
    runner?: QueryRunner,
  ): Promise<ProductPrice> {
    const qr = runner ?? this.dataSource.createQueryRunner();
    const isExternal = !!runner;

    if (!isExternal) {
      await qr.connect();
      await qr.startTransaction();
    }

    try {
      const repo = qr.manager.getRepository(ProductPrice);

      const duplicate = await repo.findOne({
        where: {
          productId: params.productId,
          priceTypeId: params.priceTypeId,
          academicYearId: params.academicYearId ?? IsNull(),
          classId: params.classId ?? IsNull(),
          enrollmentId: params.enrollmentId ?? IsNull(),
          personId: params.personId ?? IsNull(),
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'Ya existe un precio con esta combinación para el producto',
        );
      }

      const productPrice = repo.create({
        productId: params.productId,
        price: params.price,
        priceTypeId: params.priceTypeId,
        academicYearId: params.academicYearId,
        classId: params.classId,
        enrollmentId: params.enrollmentId,
        personId: params.personId,
        isActive: params.isActive ?? true,
      });

      const productPriceSaved = await repo.save(productPrice);

      if (!isExternal) {
        await qr.commitTransaction();
      }
      return productPriceSaved;
    } catch (error) {
      if (!isExternal) await qr.rollbackTransaction();
      throw error;
    } finally {
      if (!isExternal) await qr.release();
    }
  }

  async createEnrollmentPrice(
    params: {
      productId: string;
      price: number;
      academicYearId: string;
      classId: string;
      enrollmentId: string;
      personId: string;
    },
    runner?: QueryRunner,
  ) {
    return this.create(
      {
        ...params,
        priceTypeId: ProductPriceTypeId.ENROLLMENT,
      },
      runner,
    );
  }

  async createClassAcademicYearPrice(params: {
    productId: string;
    price: number;
    academicYearId: string;
    classId: string;
  }) {
    return this.create({
      ...params,
      enrollmentId: null,
      personId: null,
      priceTypeId: ProductPriceTypeId.CLASS_ACADEMIC_YEAR,
    });
  }

  async createGlobalPrice(
    params: {
      productId: string;
      price: number;
    },
    runner?: QueryRunner,
  ) {
    return this.create(
      {
        ...params,
        academicYearId: null,
        classId: null,
        enrollmentId: null,
        personId: null,
        priceTypeId: ProductPriceTypeId.GLOBAL,
      },
      runner,
    );
  }

  async updateClassAcademicYearPrice(
    id: string,
    price: number,
  ): Promise<ProductPrice> {
    const repo = this.dataSource.getRepository(ProductPrice);
    const existing = await repo.findOneBy({ id });
    if (!existing)
      throw new NotFoundException(`Precio con ID ${id} no encontrado`);
    return repo.save({ ...existing, price });
  }

  async remove(id: string): Promise<void> {
    const repo = this.dataSource.getRepository(ProductPrice);
    const price = await repo.findOneBy({ id });
    if (!price)
      throw new NotFoundException(`Precio con ID ${id} no encontrado`);
    await repo.remove(price);
  }

  async findAvailableProducts(classId: string, academicYearId: string) {
    return this.dataSource
      .getRepository(Product)
      .createQueryBuilder('p')
      .where('p.isActive = true')
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM product_prices pp
          WHERE pp.product_id = p.id
            AND pp.class_id = :classId
            AND pp.academic_year_id = :academicYearId
            AND pp.price_type_id = :priceTypeId
        )`,
        { classId, academicYearId, priceTypeId: ProductPriceTypeId.CLASS_ACADEMIC_YEAR },
      )
      .select(['p.id', 'p.name', 'p.description'])
      .orderBy('p.name', 'ASC')
      .getMany();
  }

  async findByClassAndYear(classId: string, academicYearId: string) {
    const repo = this.dataSource.getRepository(ProductPrice);
    return repo.find({
      where: {
        classId,
        academicYearId,
        priceTypeId: ProductPriceTypeId.CLASS_ACADEMIC_YEAR,
      },
      relations: { product: true },
      order: { product: { name: 'ASC' } },
    });
  }

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
