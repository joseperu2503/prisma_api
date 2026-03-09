import {
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

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { student, ...enrollmentData } = createEnrollmentDto;

      const savedStudent = await this.studentService.updateOrCreate(
        student,
        queryRunner,
      );

      // Check if student is already enrolled in this academic year
      const existingEnrollment = await queryRunner.manager.findOne(Enrollment, {
        where: {
          studentId: savedStudent.id,
          academicYearId: createEnrollmentDto.academicYearId,
        },
      });

      if (!existingEnrollment) {
        const enrollment = queryRunner.manager.create(Enrollment, {
          ...enrollmentData,
          studentId: savedStudent.id,
        });

        await queryRunner.manager.save(enrollment);
      }

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the enrollment',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.enrollmentRepository.find({
      relations: {
        student: { person: true },
        classroom: true,
        academicYear: true,
      },
    });
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

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto) {
    const enrollment = await this.findOne(id);
    const updatedEnrollment = this.enrollmentRepository.merge(
      enrollment,
      updateEnrollmentDto,
    );
    return await this.enrollmentRepository.save(updatedEnrollment);
  }

  async remove(id: string) {
    const enrollment = await this.findOne(id);
    return await this.enrollmentRepository.remove(enrollment);
  }

  async findByYear(academicYearId: string) {
    return await this.enrollmentRepository.find({
      where: { academicYearId },
      relations: {
        student: { person: true },
        classroom: true,
      },
    });
  }

  async findByClassroom(classroomId: string, academicYearId: string) {
    return await this.enrollmentRepository.find({
      where: { classroomId, academicYearId },
      relations: {
        student: { person: true },
      },
    });
  }
}
