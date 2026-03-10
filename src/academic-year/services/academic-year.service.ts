import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateAcademicYearDto } from '../dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from '../dto/update-academic-year.dto';
import { AcademicYear } from '../entities/academic-year.entity';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    private readonly dataSource: DataSource,
  ) {}

  private async checkOverlap(
    startDate: string,
    endDate: string,
    excludeId?: string,
  ) {
    const qb = this.academicYearRepository
      .createQueryBuilder('ay')
      .where('ay.startDate <= :endDate AND ay.endDate >= :startDate', {
        startDate,
        endDate,
      });

    if (excludeId) {
      qb.andWhere('ay.id != :excludeId', { excludeId });
    }

    const overlapping = await qb.getOne();

    if (overlapping) {
      throw new ConflictException(
        `Las fechas se solapan con el año académico "${overlapping.name}" (${overlapping.startDate} - ${overlapping.endDate})`,
      );
    }
  }

  private async checkNameDuplicate(name: string, excludeId?: string) {
    const qb = this.academicYearRepository
      .createQueryBuilder('ay')
      .where('LOWER(ay.name) = :name', { name: name.toLowerCase() });

    if (excludeId) {
      qb.andWhere('ay.id != :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(
        `Ya existe un año académico con el nombre "${existing.name}"`,
      );
    }
  }

  async create(createAcademicYearDto: CreateAcademicYearDto) {
    await this.checkNameDuplicate(createAcademicYearDto.name);
    await this.checkOverlap(
      createAcademicYearDto.startDate,
      createAcademicYearDto.endDate,
    );
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

    if (
      updateAcademicYearDto.name &&
      updateAcademicYearDto.name.toLowerCase() !== academicYear.name.toLowerCase()
    ) {
      await this.checkNameDuplicate(updateAcademicYearDto.name, id);
    }

    const startDate = updateAcademicYearDto.startDate;
    const endDate = updateAcademicYearDto.endDate;

    if (updateAcademicYearDto.startDate || updateAcademicYearDto.endDate) {
      await this.checkOverlap(startDate, endDate, id);
    }

    const updatedAcademicYear = this.academicYearRepository.merge(
      academicYear,
      updateAcademicYearDto,
    );
    return await this.academicYearRepository.save(updatedAcademicYear);
  }

  async remove(id: string) {
    const academicYear = await this.findOne(id);
    const enrollmentCount = await this.dataSource
      .getRepository(Enrollment)
      .countBy({ academicYearId: id });
    if (enrollmentCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el año académico porque tiene ${enrollmentCount} matrícula(s) asociada(s)`,
      );
    }
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
