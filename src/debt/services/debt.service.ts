import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ListDebtDto } from '../dto/list-debt.dto';
import { Debt } from '../entities/debt.entity';

@Injectable()
export class DebtService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepo: Repository<Debt>,

    private readonly dataSource: DataSource,
  ) {}

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
