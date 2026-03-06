import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearController } from './controllers/academic-year.controller';
import { AcademicYear } from './entities/academic-year.entity';
import { AcademicYearService } from './services/academic-year.service';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYear])],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
  exports: [AcademicYearService, TypeOrmModule],
})
export class AcademicYearModule {}
