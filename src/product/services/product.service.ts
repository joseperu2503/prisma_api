import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductPriceDto } from '../dto/create-product-price.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { ListProductDto } from '../dto/list-product.dto';
import { UpdateProductPriceDto } from '../dto/update-product-price.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductPrice } from '../entities/product-price.entity';
import { Product } from '../entities/product.entity';
import { ProductPriceTypeId } from '../enums/product-price-type-id.enum';
import { ProductPriceService } from './product-price.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,

    @InjectRepository(ProductPrice)
    private readonly priceRepo: Repository<ProductPrice>,

    private readonly priceSvc: ProductPriceService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto) {
    const { price, ...productData } = dto;

    const existing = await this.repo.findOneBy({ name: dto.name });
    if (existing) {
      throw new ConflictException(
        `Ya existe un producto con el nombre "${dto.name}"`,
      );
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const product = qr.manager.create(Product, {
        isActive: true,
        ...productData,
      });
      const saved = await qr.manager.save(product);

      if (price !== undefined && price !== null) {
        await this.priceSvc.createGlobalPrice(
          { productId: saved.id, price },
          qr,
        );
      }

      await qr.commitTransaction();
      return this.findOne(saved.id);
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }

  async findAll(params: ListProductDto) {
    const { pagination, search, classId, academicYearId } = params;
    const page = pagination?.page;
    const limit = pagination?.limit;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.unitCode', 'uc')
      .leftJoinAndSelect('p.igvAffectationType', 'igv')
      .orderBy('p.name', 'ASC');

    if (classId && academicYearId) {
      qb.leftJoinAndSelect(
        'p.prices',
        'pr',
        'pr.classId = :classId AND pr.academicYearId = :academicYearId AND pr.priceTypeId = :cay',
        { classId, academicYearId, cay: ProductPriceTypeId.CLASS_ACADEMIC_YEAR },
      );
    } else {
      qb.leftJoinAndSelect(
        'p.prices',
        'pr',
        'pr.priceTypeId = :global AND pr.academicYearId IS NULL AND pr.classId IS NULL AND pr.enrollmentId IS NULL AND pr.personId IS NULL',
        { global: ProductPriceTypeId.GLOBAL },
      );
    }

    if (search) {
      qb.where('LOWER(p.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    let data: Product[];
    let total: number;

    if (page && limit) {
      total = await qb.getCount();
      data = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
    } else {
      data = await qb.getMany();
      total = data.length;
    }

    return {
      data,
      total,
      pagination: page && limit ? { page, limit } : undefined,
    };
  }

  async findOne(id: string) {
    const product = await this.repo.findOne({
      where: { id },
      relations: {
        unitCode: true,
        igvAffectationType: true,
        prices: { academicYear: true, class: true, enrollment: true },
      },
      order: { prices: { createdAt: 'ASC' } },
    });
    if (!product)
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (dto.name && dto.name !== product.name) {
      const existing = await this.repo.findOneBy({ name: dto.name });
      if (existing) {
        throw new ConflictException(
          `Ya existe un producto con el nombre "${dto.name}"`,
        );
      }
    }

    const { price, ...productData } = dto;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      Object.assign(product, productData);
      await qr.manager.save(product);

      const globalPrice = await this.priceRepo.findOne({
        where: {
          productId: id,
          priceTypeId: ProductPriceTypeId.GLOBAL,
        },
      });

      if (price !== undefined && price !== null) {
        if (globalPrice) {
          await qr.manager.save(ProductPrice, { ...globalPrice, price });
        } else {
          await this.priceSvc.createGlobalPrice({ productId: id, price }, qr);
        }
      } else if (price === null && globalPrice) {
        await qr.manager.remove(ProductPrice, globalPrice);
      }

      await qr.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return this.repo.remove(product);
  }

  async toggleActive(id: string) {
    const product = await this.findOne(id);
    product.isActive = !product.isActive;
    return this.repo.save(product);
  }

  // Prices

  async addPrice(productId: string, dto: CreateProductPriceDto) {
    let typeId = ProductPriceTypeId.GLOBAL;

    if (dto.academicYearId && dto.classId) {
      typeId = ProductPriceTypeId.CLASS_ACADEMIC_YEAR;
    }

    if (dto.enrollmentId) {
      typeId = ProductPriceTypeId.ENROLLMENT;
    }

    await this.findOne(productId);
    const productPrice = this.priceRepo.create({
      ...dto,
      productId,
      isActive: true,
      academicYearId: dto.academicYearId ?? null,
      classId: dto.classId ?? null,
      enrollmentId: dto.enrollmentId ?? null,
      priceTypeId: typeId,
      personId: dto.personId ?? null,
    });
    return this.priceRepo.save(productPrice);
  }

  async updatePrice(
    productId: string,
    priceId: string,
    dto: UpdateProductPriceDto,
  ) {
    const price = await this.findPrice(productId, priceId);
    Object.assign(price, dto);
    return this.priceRepo.save(price);
  }

  async removePrice(productId: string, priceId: string) {
    const price = await this.findPrice(productId, priceId);
    return this.priceRepo.remove(price);
  }

  async togglePriceActive(productId: string, priceId: string) {
    const price = await this.findPrice(productId, priceId);
    price.isActive = !price.isActive;
    return this.priceRepo.save(price);
  }

  private async findPrice(productId: string, priceId: string) {
    const price = await this.priceRepo.findOne({
      where: { id: priceId, productId },
    });
    if (!price) {
      throw new NotFoundException(`Precio con ID ${priceId} no encontrado`);
    }
    return price;
  }
}
