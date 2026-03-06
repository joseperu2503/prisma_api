import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AcademicYearSeed {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  academicYears = [
    {
      name: '2026',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-12-31'),
    },
  ];

  async run() {
    for (const year of this.academicYears) {
      await this.create(year);
    }
  }

  async create(params: { name: string; startDate: Date; endDate: Date }) {
    const { name } = params;

    const existingYear = await this.academicYearRepository.findOne({
      where: { name },
    });

    if (existingYear) {
      existingYear.startDate = params.startDate;
      existingYear.endDate = params.endDate;
      return await this.academicYearRepository.save(existingYear);
    } else {
      const newYear = this.academicYearRepository.create(params);
      return await this.academicYearRepository.save(newYear);
    }
  }
}
