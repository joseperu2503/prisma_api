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

  async findAllPaginated(page: number, limit: number, search?: string) {
    const qb = this.academicYearRepository
      .createQueryBuilder('ay')
      .orderBy('ay.startDate', 'DESC');

    if (search) {
      qb.where('LOWER(ay.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
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

  async toggleActive(id: string) {
    const academicYear = await this.findOne(id);
    academicYear.isActive = !academicYear.isActive;
    return await this.academicYearRepository.save(academicYear);
  }

  async findByName(name: string) {
    return await this.academicYearRepository.findOneBy({ name });
  }

  async findOrCreate(name: string) {
    let academicYear = await this.findByName(name);
    if (!academicYear) {
      // Default to current year dates if not found
      const year = parseInt(name) || new Date().getFullYear();
      academicYear = await this.create({
        name,
        startDate: `${year}-03-01`,
        endDate: `${year}-12-31`,
      });
    }
    return academicYear;
  }
}
