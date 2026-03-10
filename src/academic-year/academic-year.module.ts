import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeYear } from 'src/grade/entities/grade-year.entity';
import { AcademicYearController } from './controllers/academic-year.controller';
import { AcademicYear } from './entities/academic-year.entity';
import { AcademicYearService } from './services/academic-year.service';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYear, GradeYear])],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
  exports: [AcademicYearService, TypeOrmModule],
})
export class AcademicYearModule {}
