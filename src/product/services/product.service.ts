import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePresentationDto } from '../dto/create-presentation.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { ListProductDto } from '../dto/list-product.dto';
import { UpdatePresentationDto } from '../dto/update-presentation.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductPresentation } from '../entities/product-presentation.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,

    @InjectRepository(ProductPresentation)
    private readonly presentationRepo: Repository<ProductPresentation>,
  ) {}

  async create(dto: CreateProductDto) {
    const { presentations, ...productData } = dto;
    const product = this.repo.create({ isActive: true, ...productData });
    const saved = await this.repo.save(product);

    if (presentations?.length) {
      const rows = presentations.map((p) =>
        this.presentationRepo.create({
          ...p,
          productId: saved.id,
          isActive: true,
          academicYearId: p.academicYearId ?? null,
          classId: p.classId ?? null,
        }),
      );
      await this.presentationRepo.save(rows);
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
      .leftJoinAndSelect('p.presentations', 'pr')
      .orderBy('p.name', 'ASC');

    if (search) {
      qb.where('LOWER(p.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
    }

    let data: Product[];
    let total: number;

    if (page && limit) {
      total = await qb.getCount();
      data = await qb.skip((page - 1) * limit).take(limit).getMany();
    } else {
      data = await qb.getMany();
      total = data.length;
    }

    return { data, total, pagination: page && limit ? { page, limit } : undefined };
  }

  async findOne(id: string) {
    const product = await this.repo.findOne({
      where: { id },
      relations: { unitCode: true, igvAffectationType: true, presentations: { academicYear: true, class: true } },
      order: { presentations: { createdAt: 'ASC' } },
    });
    if (!product) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
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

  // Presentations

  async addPresentation(productId: string, dto: CreatePresentationDto) {
    await this.findOne(productId);
    const presentation = this.presentationRepo.create({
      ...dto,
      productId,
      isActive: true,
      academicYearId: dto.academicYearId ?? null,
      classId: dto.classId ?? null,
    });
    return this.presentationRepo.save(presentation);
  }

  async updatePresentation(productId: string, presentationId: string, dto: UpdatePresentationDto) {
    const presentation = await this.findPresentation(productId, presentationId);
    Object.assign(presentation, dto);
    return this.presentationRepo.save(presentation);
  }

  async removePresentation(productId: string, presentationId: string) {
    const presentation = await this.findPresentation(productId, presentationId);
    return this.presentationRepo.remove(presentation);
  }

  async togglePresentationActive(productId: string, presentationId: string) {
    const presentation = await this.findPresentation(productId, presentationId);
    presentation.isActive = !presentation.isActive;
    return this.presentationRepo.save(presentation);
  }

  private async findPresentation(productId: string, presentationId: string) {
    const presentation = await this.presentationRepo.findOne({
      where: { id: presentationId, productId },
    });
    if (!presentation) {
      throw new NotFoundException(`Presentación con ID ${presentationId} no encontrada`);
    }
    return presentation;
  }
}
