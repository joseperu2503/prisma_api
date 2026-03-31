import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BulkSaveMatrixDto } from '../dto/bulk-save-matrix.dto';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { ListDebtDto } from '../dto/list-debt.dto';
import { ChargeSchedule } from '../entities/charge-schedule.entity';
import { Debt } from '../entities/debt.entity';
import { PersonChargeSchedule } from '../entities/person-charge-schedule.entity';
import { DebtStatusId } from '../enums/debt-status-id.enum';

@Injectable()
export class DebtService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepo: Repository<Debt>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateDebtDto): Promise<Debt> {
    const discount = dto.discount ?? 0;
    const debt = this.debtRepo.create({
      personId: dto.personId,
      baseAmount: dto.baseAmount,
      discount,
      amount: dto.baseAmount - discount,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      notes: dto.notes ?? null,
      statusId: DebtStatusId.PENDING,
    });
    return this.debtRepo.save(debt);
  }

  async bulkSave(
    dto: BulkSaveMatrixDto,
  ): Promise<{ updated: number; created: number }> {
    const pfiRepo = this.dataSource.getRepository(PersonChargeSchedule);

    // Update existing debt amounts
    let updated = 0;
    if (dto.updates.length > 0) {
      for (const item of dto.updates) {
        const discount = item.discount ?? 0;
        await this.debtRepo.update(item.debtId, {
          baseAmount: item.baseAmount,
          discount,
          amount: item.baseAmount - discount,
        });
      }
      updated = dto.updates.length;
    }

    // Toggle applies on existing PersonChargeInstallment records
    if (dto.toggles.length > 0) {
      for (const item of dto.toggles) {
        await pfiRepo.update(
          { personId: item.personId, chargeScheduleId: item.installmentId },
          { applies: item.applies },
        );
      }
    }

    // Create new PersonChargeSchedule records (+ Debt if applies=true)
    let created = 0;
    if (dto.creates.length > 0) {
      const installmentIds = [
        ...new Set(dto.creates.map((c) => c.installmentId)),
      ];
      const installments = await this.dataSource
        .getRepository(ChargeSchedule)
        .find({
          where: installmentIds.map((id) => ({ id })),
          relations: { classCharge: true },
        });
      const installmentMap = new Map(installments.map((p) => [p.id, p]));

      const debtsToCreate: Debt[] = [];

      for (const item of dto.creates) {
        const installment = installmentMap.get(item.installmentId);
        if (!installment) continue;

        await pfiRepo.upsert(
          {
            personId: item.personId,
            chargeScheduleId: item.installmentId,
            applies: item.applies,
          },
          ['personId', 'chargeScheduleId'],
        );

        if (item.applies) {
          const discount = item.discount ?? 0;
          debtsToCreate.push(
            this.debtRepo.create({
              personId: item.personId,
              chargeScheduleId: item.installmentId,
              baseAmount: item.baseAmount,
              discount,
              amount: item.baseAmount - discount,
              statusId: DebtStatusId.PENDING,
              dueDate: installment.dueDate
                ? new Date(installment.dueDate)
                : null,
            }),
          );
        }
      }

      if (debtsToCreate.length > 0) {
        await this.debtRepo.save(debtsToCreate);
        created = debtsToCreate.length;
      }
    }

    return { updated, created };
  }

  async findAll(dto: ListDebtDto): Promise<Debt[]> {
    const qb = this.debtRepo
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.presentation', 'presentation')
      .leftJoinAndSelect('debt.status', 'status')
      .leftJoinAndSelect('debt.chargeSchedule', 'chargeSchedule')
      .leftJoinAndSelect('chargeSchedule.classCharge', 'classCharge')
      .leftJoinAndSelect('classCharge.classAcademicYear', 'cay')
      .leftJoinAndSelect('cay.class', 'class')
      .leftJoinAndSelect('cay.academicYear', 'academicYear')
      .orderBy('debt.createdAt', 'DESC');

    if (dto.personId) {
      qb.andWhere('debt.personId = :personId', { personId: dto.personId });
    }

    if (dto.academicYearId) {
      qb.andWhere('cay.academicYearId = :academicYearId', {
        academicYearId: dto.academicYearId,
      });
    }

    if (dto.presentationId) {
      qb.andWhere('debt.presentationId = :presentationId', {
        presentationId: dto.presentationId,
      });
    }

    if (dto.statusId) {
      qb.andWhere('debt.statusId = :statusId', { statusId: dto.statusId });
    }

    return qb.getMany();
  }
}
