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
import { ChargeItem } from 'src/charge/entities/charge-item.entity';
import { Charge } from 'src/charge/entities/charge.entity';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { PlanConfiguration } from 'src/plan/entities/plan-configuration.entity';
import { Subscription } from 'src/plan/entities/subscription.entity';
import { ProductPrice } from 'src/product/entities/product-price.entity';
import { Product } from 'src/product/entities/product.entity';
import { StudentService } from 'src/student/services/student.service';
import { DataSource, In, IsNull, Repository } from 'typeorm';
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

      if (dto.prices && dto.prices.length > 0) {
        await queryRunner.manager.save(
          ProductPrice,
          dto.prices.map((p) =>
            queryRunner.manager.create(ProductPrice, {
              productId: p.productId,
              price: p.price,
              enrollmentId: enrollment.id,
              academicYearId: null,
              classId: null,
              isActive: true,
            }),
          ),
        );
      }

      const personId = savedStudent.personId;

      if (dto.subscriptions && dto.subscriptions.length > 0) {
        for (const s of dto.subscriptions) {
          const config = await queryRunner.manager.findOne(PlanConfiguration, {
            where: { id: s.planConfigurationId },
          });
          if (!config) {
            throw new NotFoundException(
              `PlanConfiguration with id ${s.planConfigurationId} not found`,
            );
          }
          const subscription = queryRunner.manager.create(Subscription, {
            personId,
            planConfigurationId: s.planConfigurationId,
            enrollmentId: enrollment.id,
            startDate: config.startDate,
            notes: null,
            statusId: 'ACTIVE',
          });
          await queryRunner.manager.save(Subscription, subscription);
        }
      }

      // Charge por productos: un solo Charge con todos los productos como items
      if (dto.chargeProducts && dto.chargeProducts.length > 0) {
        const resolvedItems: { product: Product; price: number }[] = [];

        for (const cp of dto.chargeProducts) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: cp.productId },
            relations: { prices: true },
          });
          if (!product) {
            throw new NotFoundException(
              `Product with id ${cp.productId} not found`,
            );
          }
          const price = this.resolveProductPrice(product, dto.classId, dto.academicYearId);
          if (price === null) {
            throw new NotFoundException(
              `No active price found for product ${product.name}`,
            );
          }
          resolvedItems.push({ product, price });
        }

        const total = resolvedItems.reduce((sum, i) => sum + i.price, 0);
        const today = new Date().toISOString().split('T')[0];
        const charge = queryRunner.manager.create(Charge, {
          personId: savedStudent.personId,
          enrollmentId: enrollment.id,
          statusId: 'PENDING',
          total,
          startDate: today,
          dueDate: today,
          notes: null,
        });
        await queryRunner.manager.save(Charge, charge);

        for (const { product, price } of resolvedItems) {
          await queryRunner.manager.save(
            ChargeItem,
            queryRunner.manager.create(ChargeItem, {
              chargeId: charge.id,
              productId: product.id,
              description: product.name,
              unitPrice: price,
              quantity: 1,
              subtotal: price,
            }),
          );
        }
      }

      // Charges por suscripción: un Charge por cada periodo que aplica
      if (dto.chargeSubscriptions && dto.chargeSubscriptions.length > 0) {
        for (const cs of dto.chargeSubscriptions) {
          const config = await queryRunner.manager.findOne(PlanConfiguration, {
            where: { id: cs.planConfigurationId },
            relations: { plan: { product: { prices: true } } },
          });
          if (!config) {
            throw new NotFoundException(
              `PlanConfiguration with id ${cs.planConfigurationId} not found`,
            );
          }

          const product = config.plan.product;
          const price = this.resolveProductPrice(product, dto.classId, dto.academicYearId);
          if (price === null) {
            throw new NotFoundException(
              `No active price found for product ${product.name}`,
            );
          }

          for (const period of cs.periods) {
            const dueDate = new Date(period.dueDate);
            const startDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-01`;

            const charge = queryRunner.manager.create(Charge, {
              personId: savedStudent.personId,
              enrollmentId: enrollment.id,
              statusId: 'PENDING',
              total: price,
              startDate,
              dueDate: period.dueDate,
              notes: null,
            });
            await queryRunner.manager.save(Charge, charge);

            await queryRunner.manager.save(
              ChargeItem,
              queryRunner.manager.create(ChargeItem, {
                chargeId: charge.id,
                productId: product.id,
                description: product.name,
                unitPrice: price,
                quantity: 1,
                subtotal: price,
              }),
            );
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

  private resolveProductPrice(
    product: Product,
    classId: string,
    academicYearId: string,
  ): number | null {
    const specific = product.prices.find(
      (p) => p.isActive && p.classId === classId && p.academicYearId === academicYearId,
    );
    if (specific) return Number(specific.price);

    const global = product.prices.find(
      (p) =>
        p.isActive &&
        p.academicYearId === null &&
        p.classId === null &&
        p.enrollmentId === null,
    );
    return global ? Number(global.price) : null;
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

      if (!newClassAcademicYear) {
        throw new NotFoundException(
          'El aula no está habilitada para el año académico de esta matrícula',
        );
      }

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
