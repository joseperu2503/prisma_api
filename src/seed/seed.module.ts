import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { AdminModule } from 'src/admin/admin.module';
import { AppVersionModule } from 'src/app-version/app-version.module';
import { AppPlatform } from 'src/app-version/entities/app-platform.entity';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { AuthModule } from 'src/auth/auth.module';
import { ClassModule } from 'src/class/class.module';
import { Class } from 'src/class/entities/class.entity';
import { CommonModule } from 'src/common/common.module';
import { ChargeFrequency } from 'src/debt/entities/charge-frequency.entity';
import { DebtStatus } from 'src/debt/entities/debt-status.entity';
import { PaymentMethod } from 'src/debt/entities/payment-method.entity';
import { EmployeeModule } from 'src/employee/employee.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { GradeModule } from 'src/grade/grade.module';
import { Level } from 'src/level/entities/level.entity';
import { LevelModule } from 'src/level/level.module';
import { Person } from 'src/person/entities/person.entity';
import { IgvAffectationType } from 'src/product/entities/igv-affectation-type.entity';
import { UnitCode } from 'src/product/entities/unit-code.entity';
import { Student } from 'src/student/entities/student.entity';
import { StudentModule } from 'src/student/student.module';
import { AcademicYearSeed } from './services/academic-year.seed';
import { AdminSeed } from './services/admin.seed';
import { AppPlatformSeed } from './services/app-platform.seed';
import { AttendanceStatusSeed } from './services/attendance-status.seed';
import { AttendanceTypeSeed } from './services/attendance-type.seed';
import { AttendanceSeed } from './services/attendance.seed';
import { ChargeFrequencySeed } from './services/charge-frequency.seed';
import { ClassSeed } from './services/class.seed';
import { DebtStatusSeed } from './services/debt-status.seed';
import { DocumentTypeSeed } from './services/document-type.seed';
import { EnrollmentSeed } from './services/enrollment.seed';
import { GenderSeed } from './services/gender.seed';
import { GradeSeed } from './services/grade.seed';
import { IgvAffectationTypeSeed } from './services/igv-affectation-type.seed';
import { LevelSeed } from './services/level.seed';
import { PaymentMethodSeed } from './services/payment-method.seed';
import { PermissionSeed } from './services/permission.seed';
import { RelationshipTypeSeed } from './services/relationship-type.seed';
import { RoleSeed } from './services/role.seed';
import { SeedService } from './services/seed.service';
import { StudentSeed } from './services/student.seed';
import { UnitCodeSeed } from './services/unit-code.seed';

@Module({
  providers: [
    SeedService,
    ClassSeed,
    DocumentTypeSeed,
    GenderSeed,
    AttendanceTypeSeed,
    AttendanceStatusSeed,
    AcademicYearSeed,
    LevelSeed,
    GradeSeed,
    RelationshipTypeSeed,
    RoleSeed,
    PermissionSeed,
    StudentSeed,
    EnrollmentSeed,
    AttendanceSeed,
    AdminSeed,
    AppPlatformSeed,
    DebtStatusSeed,
    ChargeFrequencySeed,
    PaymentMethodSeed,
    UnitCodeSeed,
    IgvAffectationTypeSeed,
  ],
  imports: [
    AuthModule,
    CommonModule,
    AttendanceModule,
    EmployeeModule,
    ClassModule,
    AcademicYearModule,
    LevelModule,
    GradeModule,
    StudentModule,
    EnrollmentModule,
    AdminModule,
    AppVersionModule,
    TypeOrmModule.forFeature([
      AcademicYear,
      Class,
      Grade,
      Level,
      Enrollment,
      Person,
      Student,
      AppPlatform,
      DebtStatus,
      ChargeFrequency,
      PaymentMethod,
      UnitCode,
      IgvAffectationType,
    ]),
  ],
  exports: [SeedService],
})
export class SeedModule {}
