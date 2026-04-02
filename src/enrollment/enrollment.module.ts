import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { ClassModule } from 'src/class/class.module';
import { Debt } from 'src/debt/entities/debt.entity';
import { GradeModule } from 'src/grade/grade.module';
import { LevelModule } from 'src/level/level.module';
import { PlanConfiguration } from 'src/plan/entities/plan-configuration.entity';
import { Subscription } from 'src/plan/entities/subscription.entity';
import { ProductPrice } from 'src/product/entities/product-price.entity';
import { Product } from 'src/product/entities/product.entity';
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
      ProductPrice,
      Product,
      Debt,
      PlanConfiguration,
      Subscription,
    ]),
    StudentModule,
    AcademicYearModule,
    ClassModule,
    GradeModule,
    LevelModule,
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, EnrollmentFormOptionsService, ImportService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
