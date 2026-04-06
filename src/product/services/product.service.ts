import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductPriceDto } from '../dto/create-product-price.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { ListProductDto } from '../dto/list-product.dto';
import { UpdateProductPriceDto } from '../dto/update-product-price.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductPrice } from '../entities/product-price.entity';
import { Product } from '../entities/product.entity';
import { ProductPriceTypeId } from '../enums/product-price-type-id.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,

    @InjectRepository(ProductPrice)
    private readonly priceRepo: Repository<ProductPrice>,
  ) {}

  async create(dto: CreateProductDto) {
    const { price, ...productData } = dto;
    const product = this.repo.create({ isActive: true, ...productData });
    const saved = await this.repo.save(product);

    if (price !== undefined && price !== null) {
      const productPrice = this.priceRepo.create({
        productId: saved.id,
        price,
        academicYearId: null,
        classId: null,
        enrollmentId: null,
        isActive: true,
      });
      await this.priceRepo.save(productPrice);
    }

    return this.findOne(saved.id);
  }

  async findAll(params: ListProductDto) {
    const { pagination, search } = params;
    const page = pagination?.page;
    const limit = pagination?.limit;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.unitCode', 'uc')
      .leftJoinAndSelect('p.igvAffectationType', 'igv')
      .leftJoinAndSelect('p.prices', 'pr')
      .orderBy('p.name', 'ASC');

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
    const { price, ...productData } = dto;
    Object.assign(product, productData);
    return this.repo.save(product);
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
