import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { ClassroomModule } from 'src/classroom/classroom.module';
import { StudentModule } from 'src/student/student.module';
import { EnrollmentController } from './controllers/enrollment.controller';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentService } from './services/enrollment.service';
import { ImportService } from './services/import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    StudentModule,
    AcademicYearModule,
    ClassroomModule,
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, ImportService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
