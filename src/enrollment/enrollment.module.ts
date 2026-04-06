import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { ChargeItem } from 'src/charge/entities/charge-item.entity';
import { Charge } from 'src/charge/entities/charge.entity';
import { ClassModule } from 'src/class/class.module';
import { GradeModule } from 'src/grade/grade.module';
import { LevelModule } from 'src/level/level.module';
import { PlanConfiguration } from 'src/plan/entities/plan-configuration.entity';
import { Subscription } from 'src/plan/entities/subscription.entity';
import { ProductModule } from 'src/product/product.module';
import { StudentModule } from 'src/student/student.module';
import { EnrollmentController } from './controllers/enrollment.controller';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentFormOptionsService } from './services/enrollment-form-options.service';
import { EnrollmentService } from './services/enrollment.service';
import { ImportService } from './services/import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      PlanConfiguration,
      Subscription,
      Charge,
      ChargeItem,
    ]),
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
