import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { DebtCatalogController } from './controllers/debt-catalog.controller';
import { ClassFeeController } from './controllers/class-fee.controller';
import { DebtConceptController } from './controllers/debt-concept.controller';
import { DebtController } from './controllers/debt.controller';
import { PaymentController } from './controllers/payment.controller';
import { ClassFee } from './entities/class-fee.entity';
import { DebtConcept } from './entities/debt-concept.entity';
import { DebtConceptType } from './entities/debt-concept-type.entity';
import { Debt } from './entities/debt.entity';
import { DebtStatus } from './entities/debt-status.entity';
import { FeeFrequency } from './entities/fee-frequency.entity';
import { Payment } from './entities/payment.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { DebtCatalogService } from './services/debt-catalog.service';
import { ClassFeeService } from './services/class-fee.service';
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
      ClassFee,
      FeeFrequency,
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
    ClassFeeController,
  ],
  providers: [DebtCatalogService, DebtConceptService, DebtService, PaymentService, ClassFeeService],
  exports: [DebtService],
})
export class DebtModule {}
