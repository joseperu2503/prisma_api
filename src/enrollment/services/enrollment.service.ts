import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceLog } from 'src/attendance/entities/attendance-log.entity';
import { AttendanceSchedule } from 'src/attendance/entities/attendance-schedule.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { AttendanceStatusId } from 'src/attendance/enums/attenance-status-id.enum';
import { AttendanceTypeId } from 'src/attendance/enums/attenance-type-id.enum';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { ClassFee } from 'src/debt/entities/class-fee.entity';
import { Debt } from 'src/debt/entities/debt.entity';
import { PersonFeeInstallment } from 'src/debt/entities/person-fee-installment.entity';
import { DebtStatusId } from 'src/debt/enums/debt-status-id.enum';
import { StudentService } from 'src/student/services/student.service';
import { DataSource, In, Repository } from 'typeorm';
import { ChangeClassEnrollmentDto } from '../dto/change-class-enrollment.dto';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { ListEnrollmentDto } from '../dto/list-enrollment.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';
import { Enrollment } from '../entities/enrollment.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    private readonly studentService: StudentService,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedStudent = await this.studentService.create(
        dto.student,
        queryRunner,
      );

      const existing = await queryRunner.manager.findOne(Enrollment, {
        where: {
          studentId: savedStudent.id,
          academicYearId: dto.academicYearId,
        },
      });

      if (existing) {
        throw new ConflictException(
          'El estudiante ya está matriculado en este año académico',
        );
      }

      const enrollment = queryRunner.manager.create(Enrollment, {
        studentId: savedStudent.id,
        academicYearId: dto.academicYearId,
        gradeId: dto.gradeId,
        classId: dto.classId,
        isActive: dto.isActive ?? true,
      });

      await queryRunner.manager.save(enrollment);

      // Register PersonFeeInstallments + Debts for existing class fees
      const cay = await queryRunner.manager.findOne(ClassAcademicYear, {
        where: { classId: dto.classId, academicYearId: dto.academicYearId },
      });

      if (cay) {
        const fees = await queryRunner.manager.find(ClassFee, {
          where: { classAcademicYearId: cay.id },
          relations: { installments: true },
        });

        const overrideMap = new Map(
          (dto.feeOverrides ?? []).map((o) => [o.feeInstallmentId, o]),
        );

        for (const fee of fees) {
          for (const installment of fee.installments) {
            const override = overrideMap.get(installment.id);
            const applies = override?.applies ?? true;
            const amount = override?.amount ?? Number(installment.amount);

            await queryRunner.manager.save(
              queryRunner.manager.create(PersonFeeInstallment, {
                personId: savedStudent.personId,
                feeInstallmentId: installment.id,
                applies,
              }),
            );

            if (applies) {
              const debtRepo = queryRunner.manager.getRepository(Debt);
              await debtRepo.save(
                debtRepo.create({
                  personId: savedStudent.personId,
                  conceptId: fee.conceptId,
                  feeInstallmentId: installment.id,
                  baseAmount: amount,
                  discount: 0,
                  amount,
                  statusId: DebtStatusId.PENDING,
                  dueDate: installment.dueDate ? new Date(installment.dueDate) : null,
                }),
              );
            }
          }
        }
      }

      await queryRunner.commitTransaction();

      return { success: true, message: 'Matrícula creada correctamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          success: false,
          message: 'Error al crear la matrícula',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(params: ListEnrollmentDto) {
    const { pagination, search, academicYearId, gradeId, classId } = params;
    const page = pagination?.page;
    const limit = pagination?.limit;

    const qb = this.enrollmentRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.student', 's')
      .leftJoinAndSelect('s.person', 'p')
      .leftJoinAndSelect('e.grade', 'g')
      .leftJoinAndSelect('g.level', 'l')
      .leftJoinAndSelect('e.academicYear', 'ay')
      .leftJoinAndSelect('e.class', 'c')
      .orderBy('p.paternalLastName', 'ASC')
      .addOrderBy('p.names', 'ASC');

    if (search) {
      qb.andWhere(
        'LOWER(p.names) LIKE :search OR LOWER(p.paternalLastName) LIKE :search OR LOWER(p.maternalLastName) LIKE :search OR p.documentNumber LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (academicYearId) {
      qb.andWhere('e.academicYearId = :academicYearId', { academicYearId });
    }

    if (gradeId) {
      qb.andWhere('e.gradeId = :gradeId', { gradeId });
    }

    if (classId) {
      qb.andWhere('e.classId = :classId', { classId });
    }

    let data: Enrollment[];
    let total: number;

    if (page && limit) {
      total = await qb.getCount();
      data = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
    } else {
      data = await qb.getMany();
      total = data.length;
    }

    return {
      data,
      total,
      pagination: page && limit ? { page, limit } : undefined,
    };
  }

  async findOne(id: string) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: {
        student: { person: true },
        grade: { level: true },
        academicYear: true,
        class: true,
      },
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async update(id: string, dto: UpdateEnrollmentDto) {
    const enrollment = await this.findOne(id);
    Object.assign(enrollment, dto);
    return this.enrollmentRepository.save(enrollment);
  }

  async remove(id: string) {
    const enrollment = await this.findOne(id);
    return this.enrollmentRepository.remove(enrollment);
  }

  async toggleActive(id: string) {
    const enrollment = await this.findOne(id);
    enrollment.isActive = !enrollment.isActive;
    return this.enrollmentRepository.save(enrollment);
  }

  async changeClass(id: string, dto: ChangeClassEnrollmentDto) {
    const enrollment = await this.findOne(id);

    if (enrollment.classId === dto.classId) {
      throw new ConflictException('El estudiante ya está en esa aula');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate new class exists and is active for the same academic year
      const newClassAcademicYear = await queryRunner.manager.findOne(
        ClassAcademicYear,
        {
          where: {
            classId: dto.classId,
            academicYearId: enrollment.academicYearId,
            isActive: true,
          },
          relations: { attendanceScheduleGroup: { attendanceSchedules: true } },
        },
      );

      console.log('newClassAcademicYear', newClassAcademicYear);

      if (!newClassAcademicYear) {
        throw new NotFoundException(
          'El aula no está habilitada para el año académico de esta matrícula',
        );
      }

      // 2. Migrate existing attendance records from old class schedules to new
      const oldClassAcademicYear = await queryRunner.manager.findOne(
        ClassAcademicYear,
        {
          where: {
            classId: enrollment.classId,
            academicYearId: enrollment.academicYearId,
          },
          relations: { attendanceScheduleGroup: { attendanceSchedules: true } },
        },
      );

      if (oldClassAcademicYear) {
        const oldSchedules =
          oldClassAcademicYear.attendanceScheduleGroup.attendanceSchedules;
        const oldScheduleIds = oldSchedules.map((s) => s.id);

        const newScheduleByDay = new Map<number, AttendanceSchedule>();
        for (const s of newClassAcademicYear.attendanceScheduleGroup
          .attendanceSchedules) {
          newScheduleByDay.set(s.dayOfWeek, s);
        }

        const personId = enrollment.student.personId;
        const oldAttendances = oldScheduleIds.length
          ? await queryRunner.manager.find(Attendance, {
              where: { personId, attendanceScheduleId: In(oldScheduleIds) },
              relations: { logs: true },
            })
          : [];

        for (const attendance of oldAttendances) {
          const oldSchedule = oldSchedules.find(
            (s) => s.id === attendance.attendanceScheduleId,
          );
          const newSchedule = oldSchedule
            ? newScheduleByDay.get(oldSchedule.dayOfWeek)
            : null;

          if (!newSchedule) continue;

          // Skip if a record already exists for the new schedule on that date
          const conflict = await queryRunner.manager.findOne(Attendance, {
            where: {
              personId,
              date: attendance.date,
              attendanceScheduleId: newSchedule.id,
              roleId: attendance.roleId,
            },
          });
          if (conflict) continue;

          attendance.attendanceScheduleId = newSchedule.id;
          await queryRunner.manager.save(Attendance, attendance);

          // Reevaluate log statuses based on new schedule times
          for (const log of attendance.logs) {
            const markedAtTime = log.markedAt.toTimeString().slice(0, 8);
            let newStatusId: AttendanceStatusId;

            if (log.typeId === AttendanceTypeId.ENTRY) {
              newStatusId =
                markedAtTime <= newSchedule.entryEnd
                  ? AttendanceStatusId.ON_TIME
                  : AttendanceStatusId.LATE;
            } else {
              newStatusId =
                markedAtTime >= newSchedule.exit
                  ? AttendanceStatusId.ON_TIME
                  : AttendanceStatusId.EARLY_EXIT;
            }

            log.statusId = newStatusId;
            await queryRunner.manager.save(AttendanceLog, log);
          }
        }
      }

      // 3. Update enrollment class
      enrollment.classId = dto.classId;
      await queryRunner.manager.save(Enrollment, enrollment);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          success: false,
          message: 'Error al cambiar el aula',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
