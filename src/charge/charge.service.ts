import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BulkChargeDto } from 'src/enrollment/dto/bulk-charge.dto';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { PlanConfiguration } from 'src/plan/entities/plan-configuration.entity';
import { Product } from 'src/product/entities/product.entity';
import { ProductPriceService } from 'src/product/services/product-price.service';
import { DataSource, In, Repository } from 'typeorm';
import { ListChargesDto } from './dto/list-charges.dto';
import { ChargeItem } from './entities/charge-item.entity';
import { Charge } from './entities/charge.entity';

@Injectable()
export class ChargeService {
  constructor(
    @InjectRepository(Charge)
    private readonly chargeRepo: Repository<Charge>,

    private readonly dataSource: DataSource,

    private readonly productPriceSvc: ProductPriceService,
  ) {}

  async findAll(dto: ListChargesDto): Promise<Charge[]> {
    const qb = this.chargeRepo
      .createQueryBuilder('charge')
      .leftJoinAndSelect('charge.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('charge.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.academicYear', 'academicYear')
      .orderBy('charge.dueDate', 'ASC')
      .addOrderBy('charge.createdAt', 'DESC');

    if (dto.personId) {
      qb.andWhere('charge.personId = :personId', { personId: dto.personId });
    }

    if (dto.enrollmentId) {
      qb.andWhere('charge.enrollmentId = :enrollmentId', { enrollmentId: dto.enrollmentId });
    }

    if (dto.academicYearId) {
      qb.andWhere('academicYear.id = :academicYearId', { academicYearId: dto.academicYearId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Charge> {
    const charge = await this.chargeRepo.findOne({
      where: { id },
      relations: {
        items: { product: true },
        enrollment: { academicYear: true, class: true, grade: true },
        person: true,
      },
    });

    if (!charge) throw new NotFoundException(`Charge with id ${id} not found`);
    return charge;
  }

  async bulkCharge(
    dto: BulkChargeDto,
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const enrollments = await queryRunner.manager.find(Enrollment, {
        where: { id: In(dto.enrollmentIds) },
        relations: { student: { person: true } },
      });

      if (enrollments.length === 0) {
        throw new NotFoundException('No se encontraron matrículas');
      }

      for (const enrollment of enrollments) {
        const personId = enrollment.student.personId;

        if (dto.chargeProducts && dto.chargeProducts.length > 0) {
          const resolvedItems: { product: Product; price: number }[] = [];

          for (const cp of dto.chargeProducts) {
            const product = await queryRunner.manager.findOne(Product, {
              where: { id: cp.productId },
            });
            if (!product) {
              throw new NotFoundException(
                `Product with id ${cp.productId} not found`,
              );
            }
            const price = await this.productPriceSvc.resolvePrice(
              product.id,
              {
                classId: dto.classId,
                academicYearId: dto.academicYearId,
                enrollmentId: enrollment.id,
              },
              queryRunner,
            );
            if (price === null) {
              throw new NotFoundException(
                `No active price found for product ${product.name}`,
              );
            }
            resolvedItems.push({ product, price });
          }

          const total = resolvedItems.reduce((sum, i) => sum + i.price, 0);
          const today = new Date().toISOString().split('T')[0];
          const charge = queryRunner.manager.create(Charge, {
            personId,
            enrollmentId: enrollment.id,
            statusId: 'PENDING',
            total,
            startDate: today,
            dueDate: today,
            notes: null,
          });
          await queryRunner.manager.save(Charge, charge);

          for (const { product, price } of resolvedItems) {
            await queryRunner.manager.save(
              ChargeItem,
              queryRunner.manager.create(ChargeItem, {
                chargeId: charge.id,
                productId: product.id,
                description: product.name,
                unitPrice: price,
                quantity: 1,
                subtotal: price,
              }),
            );
          }
        }

        if (dto.chargeSubscriptions && dto.chargeSubscriptions.length > 0) {
          for (const cs of dto.chargeSubscriptions) {
            const config = await queryRunner.manager.findOne(PlanConfiguration, {
              where: { id: cs.planConfigurationId },
              relations: { plan: { product: true } },
            });
            if (!config) {
              throw new NotFoundException(
                `PlanConfiguration with id ${cs.planConfigurationId} not found`,
              );
            }

            const product = config.plan.product;
            const price = await this.productPriceSvc.resolvePrice(
              product.id,
              {
                classId: dto.classId,
                academicYearId: dto.academicYearId,
                enrollmentId: enrollment.id,
              },
              queryRunner,
            );
            if (price === null) {
              throw new NotFoundException(
                `No active price found for product ${product.name}`,
              );
            }

            for (const period of cs.periods) {
              const dueDate = new Date(period.dueDate);
              const startDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-01`;

              const charge = queryRunner.manager.create(Charge, {
                personId,
                enrollmentId: enrollment.id,
                statusId: 'PENDING',
                total: price,
                startDate,
                dueDate: period.dueDate,
                notes: null,
              });
              await queryRunner.manager.save(Charge, charge);

              await queryRunner.manager.save(
                ChargeItem,
                queryRunner.manager.create(ChargeItem, {
                  chargeId: charge.id,
                  productId: product.id,
                  description: product.name,
                  unitPrice: price,
                  quantity: 1,
                  subtotal: price,
                }),
              );
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'Cargos registrados correctamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          success: false,
          message: 'Error al registrar cargos',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
