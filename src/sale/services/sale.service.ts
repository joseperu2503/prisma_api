import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { ListSalesDto } from '../dto/list-sales.dto';
import { PayInstallmentDto } from '../dto/pay-installment.dto';
import { SaleInstallment } from '../entities/sale-installment.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { Sale } from '../entities/sale.entity';
import { SaleInstallmentStatusId } from '../enums/sale-installment-status-id.enum';
import { SaleStatusId } from '../enums/sale-status-id.enum';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,

    @InjectRepository(SaleItem)
    private readonly itemRepo: Repository<SaleItem>,

    @InjectRepository(SaleInstallment)
    private readonly installmentRepo: Repository<SaleInstallment>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSaleDto): Promise<Sale> {
    return this.dataSource.transaction(async (manager) => {
      let saleSubtotal = 0;
      let saleIgvAmount = 0;
      let saleTotal = 0;

      const itemsToSave: Partial<SaleItem>[] = dto.items.map((itemDto) => {
        const qty = itemDto.quantity;
        const unitPrice = itemDto.unitPrice;
        let itemSubtotal: number;
        let igvItem: number;

        if (itemDto.igvAffectationTypeId === '10') {
          // gravado: price includes IGV (18%)
          itemSubtotal = Math.round((unitPrice * qty / 1.18) * 100) / 100;
          igvItem = Math.round((unitPrice * qty - itemSubtotal) * 100) / 100;
        } else {
          // exonerado / inafecto
          itemSubtotal = Math.round(unitPrice * qty * 100) / 100;
          igvItem = 0;
        }

        const itemTotal = Math.round((itemSubtotal + igvItem) * 100) / 100;

        saleSubtotal = Math.round((saleSubtotal + itemSubtotal) * 100) / 100;
        saleIgvAmount = Math.round((saleIgvAmount + igvItem) * 100) / 100;
        saleTotal = Math.round((saleTotal + itemTotal) * 100) / 100;

        return {
          productPresentationId: itemDto.productPresentationId,
          quantity: qty,
          unitPrice,
          subtotal: itemSubtotal,
          igvAmount: igvItem,
          total: itemTotal,
        };
      });

      const sale = manager.create(Sale, {
        personId: dto.personId ?? null,
        saleDate: dto.saleDate ? new Date(dto.saleDate) : new Date(),
        saleTypeId: dto.saleTypeId,
        statusId: SaleStatusId.OPEN,
        subtotal: saleSubtotal,
        igvAmount: saleIgvAmount,
        total: saleTotal,
        notes: dto.notes ?? null,
        academicYearId: dto.academicYearId ?? null,
      });

      const savedSale = await manager.save(Sale, sale);

      const items = itemsToSave.map((item) =>
        manager.create(SaleItem, { ...item, saleId: savedSale.id }),
      );
      await manager.save(SaleItem, items);

      const installments = dto.installments.map((instDto) =>
        manager.create(SaleInstallment, {
          saleId: savedSale.id,
          installmentNumber: instDto.installmentNumber,
          amount: instDto.amount,
          dueDate: new Date(instDto.dueDate),
          statusId: SaleInstallmentStatusId.PENDING,
        }),
      );
      await manager.save(SaleInstallment, installments);

      return manager.findOne(Sale, {
        where: { id: savedSale.id },
        relations: { items: true, installments: true },
      }) as Promise<Sale>;
    });
  }

  async findAll(dto: ListSalesDto): Promise<{ data: Sale[]; total: number }> {
    const qb = this.saleRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.person', 'person')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.productPresentation', 'productPresentation')
      .leftJoinAndSelect('sale.installments', 'installments')
      .orderBy('sale.saleDate', 'DESC');

    if (dto.personId) {
      qb.andWhere('sale.personId = :personId', { personId: dto.personId });
    }
    if (dto.statusId) {
      qb.andWhere('sale.statusId = :statusId', { statusId: dto.statusId });
    }
    if (dto.saleTypeId) {
      qb.andWhere('sale.saleTypeId = :saleTypeId', { saleTypeId: dto.saleTypeId });
    }
    if (dto.dateFrom) {
      qb.andWhere('sale.saleDate >= :dateFrom', { dateFrom: new Date(dto.dateFrom) });
    }
    if (dto.dateTo) {
      qb.andWhere('sale.saleDate <= :dateTo', { dateTo: new Date(dto.dateTo) });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Sale> {
    return this.saleRepo.findOne({
      where: { id },
      relations: {
        person: true,
        items: { productPresentation: { product: true } },
        installments: true,
      },
    }) as Promise<Sale>;
  }

  async payInstallment(
    installmentId: string,
    dto: PayInstallmentDto,
  ): Promise<SaleInstallment> {
    return this.dataSource.transaction(async (manager) => {
      const installment = await manager.findOne(SaleInstallment, {
        where: { id: installmentId },
        relations: { sale: true },
      });

      if (!installment) {
        throw new Error(`Installment ${installmentId} not found`);
      }

      installment.paidAt = new Date(dto.paidAt);
      installment.payments = dto.payments;
      installment.statusId = SaleInstallmentStatusId.PAID;
      installment.notes = dto.notes ?? null;

      await manager.save(SaleInstallment, installment);

      const allInstallments = await manager.find(SaleInstallment, {
        where: { saleId: installment.saleId },
      });

      const allPaid = allInstallments.every(
        (inst) => inst.statusId === SaleInstallmentStatusId.PAID,
      );

      if (allPaid) {
        await manager.update(Sale, { id: installment.saleId }, {
          statusId: SaleStatusId.COMPLETED,
        });
      }

      return installment;
    });
  }

  async cancel(id: string): Promise<Sale> {
    return this.dataSource.transaction(async (manager) => {
      await manager.update(Sale, { id }, { statusId: SaleStatusId.CANCELLED });

      await manager.update(
        SaleInstallment,
        { saleId: id, statusId: SaleInstallmentStatusId.PENDING },
        { statusId: SaleInstallmentStatusId.CANCELLED },
      );

      return manager.findOne(Sale, {
        where: { id },
        relations: { items: true, installments: true },
      }) as Promise<Sale>;
    });
  }
}
