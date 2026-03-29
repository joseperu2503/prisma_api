import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BulkSaveMatrixDto } from '../dto/bulk-save-matrix.dto';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { ListDebtDto } from '../dto/list-debt.dto';
import { Debt } from '../entities/debt.entity';
import { FeeInstallment } from '../entities/fee_installment.entity';
import { DebtStatusId } from '../enums/debt-status-id.enum';

@Injectable()
export class DebtService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepo: Repository<Debt>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateDebtDto): Promise<Debt> {
    const debt = this.debtRepo.create({
      personId: dto.personId,
      conceptId: dto.conceptId,
      amount: dto.amount,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      notes: dto.notes ?? null,
      statusId: DebtStatusId.PENDING,
    });
    return this.debtRepo.save(debt);
  }

  async bulkSave(dto: BulkSaveMatrixDto): Promise<{ updated: number; created: number }> {
    let updated = 0;

    if (dto.updates.length > 0) {
      for (const item of dto.updates) {
        await this.debtRepo.update(item.debtId, { amount: item.amount });
      }
      updated = dto.updates.length;
    }

    let created = 0;
    if (dto.creates.length > 0) {
      const installmentIds = [...new Set(dto.creates.map((c) => c.installmentId))];
      const installments = await this.dataSource.getRepository(FeeInstallment).find({
        where: installmentIds.map((id) => ({ id })),
        relations: { classFee: true },
      });
      const installmentMap = new Map(installments.map((p) => [p.id, p]));

      const toCreate = dto.creates
        .map((item) => {
          const period = installmentMap.get(item.installmentId);
          if (!period) return null;
          return this.debtRepo.create({
            personId: item.personId,
            conceptId: period.classFee.conceptId,
            classFeeId: item.classFeeId,
            amount: item.amount,
            statusId: DebtStatusId.PENDING,
            dueDate: period.dueDate ? new Date(period.dueDate) : null,
            periodDate: period.periodDate ? new Date(period.periodDate) : null,
          });
        })
        .filter((d): d is Debt => d !== null);

      await this.debtRepo.save(toCreate);
      created = toCreate.length;
    }

    return { updated, created };
  }

  async findAll(dto: ListDebtDto): Promise<Debt[]> {
    const qb = this.debtRepo
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.concept', 'concept')
      .leftJoinAndSelect('debt.status', 'status')
      .leftJoinAndSelect('debt.classFee', 'classFee')
      .leftJoinAndSelect('classFee.classAcademicYear', 'cay')
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

    if (dto.conceptId) {
      qb.andWhere('debt.conceptId = :conceptId', { conceptId: dto.conceptId });
    }

    if (dto.statusId) {
      qb.andWhere('debt.statusId = :statusId', { statusId: dto.statusId });
    }

    return qb.getMany();
  }
}
