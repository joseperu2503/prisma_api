import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentService } from 'src/student/services/student.service';
import { DataSource, Repository } from 'typeorm';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
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
      const savedStudent = await this.studentService.updateOrCreate(
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
        classroomId: dto.classroomId,
        isActive: dto.isActive ?? true,
      });

      await queryRunner.manager.save(enrollment);
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

  async findAllPaginated(page: number, limit: number, search?: string) {
    const qb = this.enrollmentRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.student', 's')
      .leftJoinAndSelect('s.person', 'p')
      .leftJoinAndSelect('e.classroom', 'c')
      .leftJoinAndSelect('e.academicYear', 'ay')
      .orderBy('p.paternalLastName', 'ASC')
      .addOrderBy('p.names', 'ASC');

    if (search) {
      qb.where(
        'LOWER(p.names) LIKE :search OR LOWER(p.paternalLastName) LIKE :search OR LOWER(p.maternalLastName) LIKE :search OR p.documentNumber LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: {
        student: { person: true },
        classroom: true,
        academicYear: true,
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
}
