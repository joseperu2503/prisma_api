import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYearService } from 'src/academic-year/services/academic-year.service';
import { Repository } from 'typeorm';
import { AssignPeriodToYearDto } from '../dto/assign-period-to-year.dto';
import { CreateAcademicPeriodDto } from '../dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from '../dto/update-academic-period.dto';
import { AcademicPeriod } from '../entities/academic-period.entity';
import { AcademicYearPeriod } from '../entities/academic-year-period.entity';

@Injectable()
export class AcademicPeriodService {
  constructor(
    @InjectRepository(AcademicPeriod)
    private readonly academicPeriodRepository: Repository<AcademicPeriod>,

    @InjectRepository(AcademicYearPeriod)
    private readonly academicYearPeriodRepository: Repository<AcademicYearPeriod>,

    private readonly academicYearService: AcademicYearService,
  ) {}

  async create(createAcademicPeriodDto: CreateAcademicPeriodDto) {
    const academicPeriod = this.academicPeriodRepository.create(
      createAcademicPeriodDto,
    );
    return await this.academicPeriodRepository.save(academicPeriod);
  }

  async findAll() {
    return await this.academicPeriodRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const academicPeriod = await this.academicPeriodRepository.findOneBy({
      id,
    });
    if (!academicPeriod) {
      throw new NotFoundException(`Academic period with ID ${id} not found`);
    }
    return academicPeriod;
  }

  async update(id: string, updateAcademicPeriodDto: UpdateAcademicPeriodDto) {
    const academicPeriod = await this.findOne(id);
    const updatedAcademicPeriod = this.academicPeriodRepository.merge(
      academicPeriod,
      updateAcademicPeriodDto,
    );
    return await this.academicPeriodRepository.save(updatedAcademicPeriod);
  }

  async remove(id: string) {
    const academicPeriod = await this.findOne(id);
    return await this.academicPeriodRepository.remove(academicPeriod);
  }

  async assignToYear(assignDto: AssignPeriodToYearDto) {
    await this.academicYearService.findOne(assignDto.academicYearId);
    await this.findOne(assignDto.academicPeriodId);

    const assignment = this.academicYearPeriodRepository.create({
      academicYearId: assignDto.academicYearId,
      academicPeriodId: assignDto.academicPeriodId,
      startDate: assignDto.startDate,
      endDate: assignDto.endDate,
    });

    return await this.academicYearPeriodRepository.save(assignment);
  }

  async findAssignmentsByYear(yearId: string) {
    return await this.academicYearPeriodRepository.find({
      where: { academicYearId: yearId },
      relations: { academicPeriod: true },
      order: { startDate: 'ASC' },
    });
  }
}
