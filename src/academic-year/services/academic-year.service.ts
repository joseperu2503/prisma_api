import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAcademicYearDto } from '../dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from '../dto/update-academic-year.dto';
import { AcademicYear } from '../entities/academic-year.entity';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  async create(createAcademicYearDto: CreateAcademicYearDto) {
    const academicYear = this.academicYearRepository.create(
      createAcademicYearDto,
    );
    return await this.academicYearRepository.save(academicYear);
  }

  async findAll() {
    return await this.academicYearRepository.find({
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const academicYear = await this.academicYearRepository.findOneBy({ id });
    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${id} not found`);
    }
    return academicYear;
  }

  async update(id: string, updateAcademicYearDto: UpdateAcademicYearDto) {
    const academicYear = await this.findOne(id);
    const updatedAcademicYear = this.academicYearRepository.merge(
      academicYear,
      updateAcademicYearDto,
    );
    return await this.academicYearRepository.save(updatedAcademicYear);
  }

  async remove(id: string) {
    const academicYear = await this.findOne(id);
    return await this.academicYearRepository.remove(academicYear);
  }
}
