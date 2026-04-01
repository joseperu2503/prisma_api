import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { ListDebtDto } from '../dto/list-debt.dto';
import { Debt } from '../entities/debt.entity';
import { DebtStatusId } from '../enums/debt-status-id.enum';

@Injectable()
export class DebtService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepo: Repository<Debt>,
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

  async findAll(dto: ListDebtDto): Promise<Debt[]> {
    const qb = this.debtRepo
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.status', 'status')
      .orderBy('debt.createdAt', 'DESC');

    if (dto.personId) {
      qb.andWhere('debt.personId = :personId', { personId: dto.personId });
    }

    if (dto.statusId) {
      qb.andWhere('debt.statusId = :statusId', { statusId: dto.statusId });
    }

    return qb.getMany();
  }
}
