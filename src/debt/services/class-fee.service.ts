import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { DebtStatusId } from 'src/debt/enums/debt-status-id.enum';
import { Student } from 'src/student/entities/student.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateClassFeeDto } from '../dto/create-class-fee.dto';
import { UpdateClassFeeDto } from '../dto/update-class-fee.dto';
import { ClassFee } from '../entities/class-fee.entity';
import { DebtConcept } from '../entities/debt-concept.entity';
import { Debt } from '../entities/debt.entity';

@Injectable()
export class ClassFeeService {
  constructor(
    @InjectRepository(ClassFee)
    private readonly repo: Repository<ClassFee>,

    private readonly dataSource: DataSource,
  ) {}

  private async resolveClassAcademicYear(classId: string, academicYearId: string) {
    const cay = await this.dataSource.getRepository(ClassAcademicYear).findOne({
      where: { classId, academicYearId },
    });
    if (!cay) throw new NotFoundException('Clase/año académico no encontrado');
    return cay;
  }

  async create(dto: CreateClassFeeDto): Promise<ClassFee> {
    const { classId, academicYearId, conceptId, ...rest } = dto;

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

    const fee = this.repo.create({ classAcademicYearId: cay.id, conceptId, ...rest });
    return this.repo.save(fee);
  }

  async findByClass(classId: string, academicYearId: string): Promise<ClassFee[]> {
    const cay = await this.resolveClassAcademicYear(classId, academicYearId);
    return this.repo.find({
      where: { classAcademicYearId: cay.id },
      relations: { concept: true, frequency: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ClassFee> {
    const fee = await this.repo.findOne({
      where: { id },
      relations: {
        concept: true,
        frequency: true,
        classAcademicYear: { class: true, academicYear: true },
      },
    });
    if (!fee) throw new NotFoundException('Cuota no encontrada');
    return fee;
  }

  async update(id: string, dto: UpdateClassFeeDto): Promise<ClassFee> {
    const fee = await this.findOne(id);
    Object.assign(fee, dto);
    return this.repo.save(fee);
  }

  async remove(id: string): Promise<void> {
    const fee = await this.repo.findOne({ where: { id } });
    if (!fee) throw new NotFoundException('Cuota no encontrada');
    await this.repo.remove(fee);
  }

  async generateDebts(id: string): Promise<{ created: number; skipped: number }> {
    const fee = await this.findOne(id);
    const { classId, academicYearId } = fee.classAcademicYear;

    const enrollments = await this.dataSource.getRepository(Enrollment).find({
      where: { classId, academicYearId, isActive: true },
      select: ['studentId'],
    });

    if (enrollments.length === 0) return { created: 0, skipped: 0 };

    const studentIds = enrollments.map((e) => e.studentId);

    const students = await this.dataSource.getRepository(Student).find({
      where: studentIds.map((id) => ({ id })),
      select: ['id', 'personId'],
    });

    const personIdByStudentId = new Map(students.map((s) => [s.id, s.personId]));

    const personIds = students.map((s) => s.personId);

    const existingDebts = await this.dataSource
      .getRepository(Debt)
      .createQueryBuilder('d')
      .select('d.personId')
      .where('d.classFeeId = :classFeeId', { classFeeId: fee.id })
      .andWhere('d.personId IN (:...personIds)', { personIds })
      .getMany();

    const alreadyHasDebt = new Set(existingDebts.map((d) => d.personId));
    const toCreate = studentIds.filter(
      (sid) => !alreadyHasDebt.has(personIdByStudentId.get(sid)!),
    );

    if (toCreate.length > 0) {
      const debts = toCreate.map((studentId) =>
        this.dataSource.getRepository(Debt).create({
          personId: personIdByStudentId.get(studentId)!,
          conceptId: fee.conceptId,
          classFeeId: fee.id,
          amount: fee.amount,
          statusId: DebtStatusId.PENDING,
        }),
      );
      await this.dataSource.getRepository(Debt).save(debts);
    }

    return { created: toCreate.length, skipped: alreadyHasDebt.size };
  }
}
