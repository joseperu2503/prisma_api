import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { DebtStatusId } from 'src/debt/enums/debt-status-id.enum';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { ProductPrice } from 'src/product/entities/product-price.entity';
import { Student } from 'src/student/entities/student.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateClassChargeDto } from '../dto/create-class-charge.dto';
import { DebtMatrixDto } from '../dto/debt-matrix.dto';
import { UpdateClassChargeDto } from '../dto/update-class-charge.dto';
import { ChargeSchedule } from '../entities/charge-schedule.entity';
import { ClassCharge } from '../entities/class-charge.entity';
import { Debt } from '../entities/debt.entity';
import { PersonChargeSchedule } from '../entities/person-charge-schedule.entity';

@Injectable()
export class ClassChargeService {
  constructor(
    @InjectRepository(ClassCharge)
    private readonly repo: Repository<ClassCharge>,

    private readonly dataSource: DataSource,
  ) {}

  private async resolveClassAcademicYear(
    classId: string,
    academicYearId: string,
  ) {
    const cay = await this.dataSource.getRepository(ClassAcademicYear).findOne({
      where: { classId, academicYearId },
    });
    if (!cay) throw new NotFoundException('Clase/año académico no encontrado');
    return cay;
  }

  async create(dto: CreateClassChargeDto): Promise<ClassCharge> {
    const {
      classId,
      academicYearId,
      presentationId,
      installments: schedules,
      students,
      ...rest
    } = dto;

    const cay = await this.resolveClassAcademicYear(classId, academicYearId);

    const presentation = await this.dataSource
      .getRepository(ProductPrice)
      .findOne({ where: { id: presentationId } });

    if (!presentation)
      throw new NotFoundException('Presentación no encontrada');

    const existing = await this.repo.findOne({
      where: {
        classAcademicYearId: cay.id,
        productPriceId: presentationId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe una cuota con esa presentación para esta clase y año académico',
      );
    }

    const charge = await this.dataSource.transaction(async (manager) => {
      const savedCharge = await manager.save(
        manager.create(ClassCharge, {
          classAcademicYearId: cay.id,
          productPriceId: presentationId,
          ...rest,
        }),
      );

      const savedInstallments = await manager.save(
        ChargeSchedule,
        schedules.map((p) =>
          manager.create(ChargeSchedule, {
            classChargeId: savedCharge.id,
            periodDate: p.periodDate ?? null,
            dueDate: p.dueDate ?? null,
            amount: savedCharge.amount,
          }),
        ),
      );

      if (students && students.length > 0) {
        const pfiEntities: PersonChargeSchedule[] = [];
        const debtEntities: Partial<Debt>[] = [];

        for (const student of students) {
          for (const entry of student.installments) {
            const inst = savedInstallments[entry.index];
            if (!inst) continue;

            pfiEntities.push(
              manager.create(PersonChargeSchedule, {
                personId: student.personId,
                chargeScheduleId: inst.id,
                applies: entry.applies,
              }),
            );

            if (entry.applies) {
              debtEntities.push({
                personId: student.personId,
                chargeScheduleId: inst.id,
                baseAmount: entry.amount,
                discount: 0,
                amount: entry.amount,
                statusId: DebtStatusId.PENDING,
                dueDate: inst.dueDate ? new Date(inst.dueDate) : null,
              });
            }
          }
        }

        await manager.save(PersonChargeSchedule, pfiEntities);

        if (debtEntities.length > 0) {
          const debtRepo = manager.getRepository(Debt);
          await debtRepo.save(debtEntities.map((d) => debtRepo.create(d)));
        }
      }

      return savedCharge;
    });

    return charge;
  }

  async findByClass(
    classId: string,
    academicYearId: string,
  ): Promise<ClassCharge[]> {
    const cay = await this.resolveClassAcademicYear(classId, academicYearId);
    return this.repo.find({
      where: { classAcademicYearId: cay.id },
      relations: {
        productPrice: true,
        frequency: true,
        schedules: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ClassCharge> {
    const charge = await this.repo.findOne({
      where: { id },
      relations: {
        productPrice: { product: true },
        frequency: true,
        schedules: true,
        classAcademicYear: { class: true, academicYear: true },
      },
    });
    if (!charge) throw new NotFoundException('Cuota no encontrada');
    return charge;
  }

  async update(id: string, dto: UpdateClassChargeDto): Promise<ClassCharge> {
    const charge = await this.repo.findOne({ where: { id } });
    if (!charge) throw new NotFoundException('Cuota no encontrada');
    Object.assign(charge, dto);
    return this.repo.save(charge);
  }

  async remove(id: string): Promise<void> {
    const charge = await this.repo.findOne({ where: { id } });
    if (!charge) throw new NotFoundException('Cuota no encontrada');
    await this.repo.remove(charge);
  }

  async getMatrix(
    classId: string,
    academicYearId: string,
  ): Promise<DebtMatrixDto> {
    const cay = await this.resolveClassAcademicYear(classId, academicYearId);

    const charges = await this.repo.find({
      where: { classAcademicYearId: cay.id },
      relations: { productPrice: { product: true }, schedules: true },
      order: { createdAt: 'ASC' },
    });

    // Build columns from all periods across all charges
    const columns: DebtMatrixDto['columns'] = [];
    for (const charge of charges) {
      const sortedPeriods = [...charge.schedules].sort((a, b) => {
        if (!a.periodDate && !b.periodDate) return 0;
        if (!a.periodDate) return -1;
        if (!b.periodDate) return 1;
        return a.periodDate.localeCompare(b.periodDate);
      });
      for (const period of sortedPeriods) {
        const productName = charge.productPrice.product.name;
      let label = productName;
        if (period.periodDate) {
          const [y, m] = period.periodDate.split('-').map(Number);
          const raw = new Date(y, m - 1, 1).toLocaleString('es', {
            month: 'short',
            year: 'numeric',
          });
          label = raw.charAt(0).toUpperCase() + raw.slice(1);
        }
        columns.push({
          installmentId: period.id,
          classChargeId: charge.id,
          conceptName: productName,
          label,
          periodDate: period.periodDate,
          dueDate: period.dueDate,
          defaultAmount: Number(period.amount),
        });
      }
    }

    // Get enrolled students
    const enrollments = await this.dataSource.getRepository(Enrollment).find({
      where: { classId, academicYearId, isActive: true },
    });

    const studentIds = enrollments.map((e) => e.studentId);
    if (studentIds.length === 0) return { columns, rows: [] };

    const students = await this.dataSource.getRepository(Student).find({
      where: studentIds.map((id) => ({ id })),
      relations: { person: true },
    });

    const installmentIds = columns.map((c) => c.installmentId);
    const personIds = students.map((s) => s.personId);

    // Load all relevant debts directly by installmentId
    let debts: Debt[] = [];
    if (installmentIds.length > 0 && personIds.length > 0) {
      debts = await this.dataSource
        .getRepository(Debt)
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.status', 'status')
        .where('d.chargeScheduleId IN (:...installmentIds)', { installmentIds })
        .andWhere('d.personId IN (:...personIds)', { personIds })
        .getMany();
    }

    // Load PersonChargeSchedule records
    let pfis: PersonChargeSchedule[] = [];
    if (installmentIds.length > 0 && personIds.length > 0) {
      pfis = await this.dataSource
        .getRepository(PersonChargeSchedule)
        .createQueryBuilder('pfi')
        .where('pfi.chargeScheduleId IN (:...installmentIds)', {
          installmentIds,
        })
        .andWhere('pfi.personId IN (:...personIds)', { personIds })
        .getMany();
    }

    // Index by "chargeScheduleId_personId"
    const debtMap = new Map<
      string,
      {
        debtId: string;
        baseAmount: number;
        amount: number;
        statusId: string;
        statusName: string | null;
      }
    >();
    for (const debt of debts) {
      debtMap.set(`${debt.chargeScheduleId}_${debt.personId}`, {
        debtId: debt.id,
        baseAmount: Number(debt.baseAmount),
        amount: Number(debt.amount),
        statusId: debt.statusId,
        statusName: (debt.status as any)?.name ?? null,
      });
    }

    const pfiMap = new Map<string, PersonChargeSchedule>();
    for (const pfi of pfis) {
      pfiMap.set(`${pfi.chargeScheduleId}_${pfi.personId}`, pfi);
    }

    // Build rows
    const rows: DebtMatrixDto['rows'] = students.map((student) => {
      const cells: DebtMatrixDto['rows'][number]['cells'] = {};
      for (const col of columns) {
        const key = `${col.installmentId}_${student.personId}`;
        const pfi = pfiMap.get(key);
        const debt = debtMap.get(key);
        cells[col.installmentId] = {
          hasRecord: !!pfi,
          applies: pfi?.applies ?? false,
          debtId: debt?.debtId ?? null,
          baseAmount: debt?.baseAmount ?? col.defaultAmount,
          amount: debt?.amount ?? col.defaultAmount,
          statusId: debt?.statusId ?? null,
          statusName: debt?.statusName ?? null,
        };
      }
      return {
        personId: student.personId,
        studentId: student.id,
        studentName: `${student.person.paternalLastName} ${student.person.maternalLastName}, ${student.person.names}`,
        cells,
      };
    });

    rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
    return { columns, rows };
  }

  async getEnrolledStudents(
    classId: string,
    academicYearId: string,
  ): Promise<{ personId: string; studentId: string; studentName: string }[]> {
    const cay = await this.resolveClassAcademicYear(classId, academicYearId);

    const enrollments = await this.dataSource.getRepository(Enrollment).find({
      where: {
        classId: cay.classId,
        academicYearId: cay.academicYearId,
        isActive: true,
      },
    });
    if (enrollments.length === 0) return [];

    const students = await this.dataSource.getRepository(Student).find({
      where: enrollments.map((e) => ({ id: e.studentId })),
      relations: { person: true },
    });

    return students
      .map((s) => ({
        personId: s.personId,
        studentId: s.id,
        studentName: `${s.person.paternalLastName} ${s.person.maternalLastName}, ${s.person.names}`,
      }))
      .sort((a, b) => a.studentName.localeCompare(b.studentName));
  }

  async generateDebts(
    id: string,
  ): Promise<{ created: number; skipped: number }> {
    const charge = await this.findOne(id);
    const { classId, academicYearId } = charge.classAcademicYear;
    const periods = charge.schedules;

    if (periods.length === 0) return { created: 0, skipped: 0 };

    const enrollments = await this.dataSource.getRepository(Enrollment).find({
      where: { classId, academicYearId, isActive: true },
      select: ['studentId'],
    });

    if (enrollments.length === 0) return { created: 0, skipped: 0 };

    const studentIds = enrollments.map((e) => e.studentId);

    const students = await this.dataSource.getRepository(Student).find({
      where: studentIds.map((sid) => ({ id: sid })),
      select: ['id', 'personId'],
    });

    const personIdByStudentId = new Map(
      students.map((s) => [s.id, s.personId]),
    );
    const personIds = students.map((s) => s.personId);

    // Load existing debts for these installments + persons to detect duplicates
    const installmentIds = periods.map((p) => p.id);
    const existingDebts = await this.dataSource
      .getRepository(Debt)
      .createQueryBuilder('d')
      .select(['d.personId', 'd.chargeScheduleId'])
      .where('d.chargeScheduleId IN (:...installmentIds)', { installmentIds })
      .andWhere('d.personId IN (:...personIds)', { personIds })
      .getMany();

    const existingSet = new Set(
      existingDebts.map((d) => `${d.personId}_${d.chargeScheduleId}`),
    );

    const toCreate: Partial<Debt>[] = [];

    for (const studentId of studentIds) {
      const personId = personIdByStudentId.get(studentId)!;
      for (const period of periods) {
        const key = `${personId}_${period.id}`;
        if (!existingSet.has(key)) {
          toCreate.push({
            personId,
            chargeScheduleId: period.id,
            baseAmount: Number(period.amount),
            discount: 0,
            amount: Number(period.amount),
            statusId: DebtStatusId.PENDING,
            dueDate: period.dueDate ? new Date(period.dueDate) : null,
          });
        }
      }
    }

    if (toCreate.length > 0) {
      const repo = this.dataSource.getRepository(Debt);
      await repo.save(toCreate.map((d) => repo.create(d)));
    }

    const total = studentIds.length * periods.length;
    return { created: toCreate.length, skipped: total - toCreate.length };
  }
}
