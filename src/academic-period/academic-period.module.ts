import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { AcademicPeriodController } from './controllers/academic-period.controller';
import { AcademicPeriod } from './entities/academic-period.entity';
import { AcademicYearPeriod } from './entities/academic-year-period.entity'; // Added this import
import { AcademicPeriodService } from './services/academic-period.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcademicPeriod, AcademicYearPeriod]),
    AcademicYearModule,
  ],
  controllers: [AcademicPeriodController],
  providers: [AcademicPeriodService],
  exports: [AcademicPeriodService, TypeOrmModule],
})
export class AcademicPeriodModule {}
