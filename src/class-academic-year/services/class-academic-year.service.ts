import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDefaultProductDto } from '../dto/create-default-product.dto';
import { DefaultProduct } from '../entities/default-product.entity';

@Injectable()
export class ClassAcademicYearService {
  constructor(
    @InjectRepository(DefaultProduct)
    private readonly defaultProductRepo: Repository<DefaultProduct>,
  ) {}

  // ── Default Products ──────────────────────────────────────────────────────

  async findProductsByClass(classId: string, academicYearId: string) {
    const data = await this.defaultProductRepo.find({
      where: { classId, academicYearId },
      relations: { product: true },
      order: { createdAt: 'ASC' },
    });

    return data.map((d) => ({
      id: d.product.id,
      name: d.product.name,
      defaultProductId: d.id,
    }));
  }

  async createDefaultProduct(
    dto: CreateDefaultProductDto,
  ): Promise<DefaultProduct> {
    const existing = await this.defaultProductRepo.findOne({
      where: {
        classId: dto.classId,
        academicYearId: dto.academicYearId,
        productId: dto.productId,
      },
    });
    if (existing)
      throw new ConflictException('Este producto ya está en los defaults');

    const entity = this.defaultProductRepo.create(dto);
    return this.defaultProductRepo.save(entity);
  }

  async removeDefaultProduct(id: string): Promise<void> {
    const entity = await this.defaultProductRepo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`DefaultProduct with id ${id} not found`);
    await this.defaultProductRepo.remove(entity);
  }
}
