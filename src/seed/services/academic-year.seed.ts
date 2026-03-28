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
    { name: '2024', startDate: '2024-03-01', endDate: '2024-12-20' },
    { name: '2025', startDate: '2025-03-01', endDate: '2025-12-19' },
    { name: '2026', startDate: '2026-03-01', endDate: '2026-12-18' },
  ];

  async run() {
    for (const year of this.academicYears) {
      await this.create(year);
    }
  }

  async create(params: { name: string; startDate: string; endDate: string }) {
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
