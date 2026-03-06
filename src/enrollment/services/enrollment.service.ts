import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';
import { Enrollment } from '../entities/enrollment.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    // Check if student is already enrolled in this academic year
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        studentId: createEnrollmentDto.studentId,
        academicYearId: createEnrollmentDto.academicYearId,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        'Student is already enrolled in this academic year',
      );
    }

    const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
    return await this.enrollmentRepository.save(enrollment);
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
