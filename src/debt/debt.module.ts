import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Person } from 'src/person/entities/person.entity';
import { ProductPresentation } from 'src/product/entities/product-presentation.entity';
import { Student } from 'src/student/entities/student.entity';
import { ClassChargeController } from './controllers/class-charge.controller';
import { DebtCatalogController } from './controllers/debt-catalog.controller';
import { DebtConceptController } from './controllers/debt-concept.controller';
import { DebtController } from './controllers/debt.controller';
import { PaymentController } from './controllers/payment.controller';
import { ClassCharge } from './entities/class-charge.entity';
import { DebtConceptType } from './entities/debt-concept-type.entity';
import { DebtConcept } from './entities/debt-concept.entity';
import { DebtStatus } from './entities/debt-status.entity';
import { Debt } from './entities/debt.entity';
import { ChargeFrequency } from './entities/charge-frequency.entity';
import { ChargeSchedule } from './entities/charge-schedule.entity';
import { PersonChargeSchedule } from './entities/person-charge-schedule.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Payment } from './entities/payment.entity';
import { ClassChargeService } from './services/class-charge.service';
import { DebtCatalogService } from './services/debt-catalog.service';
import { DebtConceptService } from './services/debt-concept.service';
import { DebtService } from './services/debt.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DebtConcept,
      DebtConceptType,
      Debt,
      DebtStatus,
      Payment,
      PaymentMethod,
      ClassCharge,
      ChargeSchedule,
      PersonChargeSchedule,
      ChargeFrequency,
      ProductPresentation,
      Person,
      Student,
      ClassAcademicYear,
      Enrollment,
    ]),
    AuthModule,
  ],
  controllers: [
    DebtCatalogController,
    DebtConceptController,
    DebtController,
    PaymentController,
    ClassChargeController,
  ],
  providers: [
    DebtCatalogService,
    DebtConceptService,
    DebtService,
    PaymentService,
    ClassChargeService,
  ],
  exports: [DebtService],
})
export class DebtModule {}
