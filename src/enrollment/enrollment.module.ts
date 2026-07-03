import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { ClassModule } from 'src/class/class.module';
import { GradeModule } from 'src/grade/grade.module';
import { LevelModule } from 'src/level/level.module';
import { ProductModule } from 'src/product/product.module';
import { StudentModule } from 'src/student/student.module';
import { EnrollmentController } from './controllers/enrollment.controller';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentFormOptionsService } from './services/enrollment-form-options.service';
import { EnrollmentService } from './services/enrollment.service';
import { ImportService } from './services/import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    StudentModule,
    AcademicYearModule,
    ClassModule,
    GradeModule,
    LevelModule,
    ProductModule,
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, EnrollmentFormOptionsService, ImportService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
