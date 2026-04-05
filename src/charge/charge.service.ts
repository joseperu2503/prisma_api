import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListChargesDto } from './dto/list-charges.dto';
import { Charge } from './entities/charge.entity';

@Injectable()
export class ChargeService {
  constructor(
    @InjectRepository(Charge)
    private readonly chargeRepo: Repository<Charge>,
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
}
