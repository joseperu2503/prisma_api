import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { DebtCatalogController } from './controllers/debt-catalog.controller';
import { DebtController } from './controllers/debt.controller';
import { PaymentController } from './controllers/payment.controller';
import { DebtStatus } from './entities/debt-status.entity';
import { Debt } from './entities/debt.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Payment } from './entities/payment.entity';
import { DebtCatalogService } from './services/debt-catalog.service';
import { DebtService } from './services/debt.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Debt,
      DebtStatus,
      Payment,
      PaymentMethod,
      Person,
      Student,
      ClassAcademicYear,
      Enrollment,
    ]),
    AuthModule,
  ],
  controllers: [
    DebtCatalogController,
    DebtController,
    PaymentController,
  ],
  providers: [
    DebtCatalogService,
    DebtService,
    PaymentService,
  ],
  exports: [DebtService],
})
export class DebtModule {}
