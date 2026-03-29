import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { DebtStatusId } from 'src/debt/enums/debt-status-id.enum';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Student } from 'src/student/entities/student.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateClassFeeDto } from '../dto/create-class-fee.dto';
import { DebtMatrixDto } from '../dto/debt-matrix.dto';
import { ClassFee } from '../entities/class-fee.entity';
import { DebtConcept } from '../entities/debt-concept.entity';
import { Debt } from '../entities/debt.entity';
import { FeeInstallment } from '../entities/fee_installment.entity';

@Injectable()
export class ClassFeeService {
  constructor(
    @InjectRepository(ClassFee)
    private readonly repo: Repository<ClassFee>,

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

  async create(dto: CreateClassFeeDto): Promise<ClassFee> {
    const { classId, academicYearId, conceptId, installments, ...rest } = dto;

    const cay = await this.resolveClassAcademicYear(classId, academicYearId);

    const concept = await this.dataSource
      .getRepository(DebtConcept)
      .findOne({ where: { id: conceptId } });

    if (!concept) throw new NotFoundException('Concepto no encontrado');

    const existing = await this.repo.findOne({
      where: { classAcademicYearId: cay.id, conceptId },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe una cuota con ese concepto para esta clase y año académico',
      );
    }

    const fee = await this.dataSource.transaction(async (manager) => {
      const savedFee = await manager.save(
        manager.create(ClassFee, {
          classAcademicYearId: cay.id,
          conceptId,
          ...rest,
        }),
      );

      const periodEntities = installments.map((p) =>
        manager.create(FeeInstallment, {
          classFeeId: savedFee.id,
          periodDate: p.periodDate ?? null,
          dueDate: p.dueDate ?? null,
          amount: p.amount,
        }),
      );
      await manager.save(FeeInstallment, periodEntities);

      return savedFee;
    });

    return fee;
  }

  async findByClass(
    classId: string,
    academicYearId: string,
  ): Promise<ClassFee[]> {
    const cay = await this.resolveClassAcademicYear(classId, academicYearId);
    return this.repo.find({
      where: { classAcademicYearId: cay.id },
      relations: { concept: true, frequency: true, installments: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ClassFee> {
    const fee = await this.repo.findOne({
      where: { id },
      relations: {
        concept: true,
        frequency: true,
        installments: true,
        classAcademicYear: { class: true, academicYear: true },
      },
    });
    if (!fee) throw new NotFoundException('Cuota no encontrada');
    return fee;
  }

  async remove(id: string): Promise<void> {
    const fee = await this.repo.findOne({ where: { id } });
    if (!fee) throw new NotFoundException('Cuota no encontrada');
    await this.repo.remove(fee);
  }

  async getMatrix(
    classId: string,
    academicYearId: string,
  ): Promise<DebtMatrixDto> {
    const cay = await this.resolveClassAcademicYear(classId, academicYearId);

    const fees = await this.repo.find({
      where: { classAcademicYearId: cay.id },
      relations: { concept: true, installments: true },
      order: { createdAt: 'ASC' },
    });

    // Build columns from all periods across all fees
    const columns: DebtMatrixDto['columns'] = [];
    for (const fee of fees) {
      const sortedPeriods = [...fee.installments].sort((a, b) => {
        if (!a.periodDate && !b.periodDate) return 0;
        if (!a.periodDate) return -1;
        if (!b.periodDate) return 1;
        return a.periodDate.localeCompare(b.periodDate);
      });
      for (const period of sortedPeriods) {
        let label = fee.concept.name;
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
          classFeeId: fee.id,
          conceptName: fee.concept.name,
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
        .where('d.feeInstallmentId IN (:...installmentIds)', { installmentIds })
        .andWhere('d.personId IN (:...personIds)', { personIds })
        .getMany();
    }

    // Index debts by "feeInstallmentId_personId"
    const debtMap = new Map<string, DebtMatrixDto['rows'][number]['cells'][string]>();
    for (const debt of debts) {
      debtMap.set(`${debt.feeInstallmentId}_${debt.personId}`, {
        debtId: debt.id,
        baseAmount: Number(debt.baseAmount),
        amount: Number(debt.amount),
        statusId: debt.statusId,
        statusName: (debt.status as any)?.name ?? null,
      });
    }

    // Build rows
    const rows: DebtMatrixDto['rows'] = students.map((student) => {
      const cells: DebtMatrixDto['rows'][number]['cells'] = {};
      for (const col of columns) {
        const existing = debtMap.get(
          `${col.installmentId}_${student.personId}`,
        );
        cells[col.installmentId] = existing ?? {
          debtId: null,
          baseAmount: col.defaultAmount,
          amount: col.defaultAmount,
          statusId: null,
          statusName: null,
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

  async generateDebts(
    id: string,
  ): Promise<{ created: number; skipped: number }> {
    const fee = await this.findOne(id);
    const { classId, academicYearId } = fee.classAcademicYear;
    const periods = fee.installments;

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
      .select(['d.personId', 'd.feeInstallmentId'])
      .where('d.feeInstallmentId IN (:...installmentIds)', { installmentIds })
      .andWhere('d.personId IN (:...personIds)', { personIds })
      .getMany();

    const existingSet = new Set(existingDebts.map((d) => `${d.personId}_${d.feeInstallmentId}`));

    const toCreate: Partial<Debt>[] = [];

    for (const studentId of studentIds) {
      const personId = personIdByStudentId.get(studentId)!;
      for (const period of periods) {
        const key = `${personId}_${period.id}`;
        if (!existingSet.has(key)) {
          toCreate.push({
            personId,
            conceptId: fee.conceptId,
            feeInstallmentId: period.id,
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
