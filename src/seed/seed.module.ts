import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { AdminModule } from 'src/admin/admin.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { AuthModule } from 'src/auth/auth.module';
import { ClassModule } from 'src/class/class.module';
import { Class } from 'src/class/entities/class.entity';
import { CommonModule } from 'src/common/common.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { GradeModule } from 'src/grade/grade.module';
import { Level } from 'src/level/entities/level.entity';
import { LevelModule } from 'src/level/level.module';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { StudentModule } from 'src/student/student.module';
import { AcademicYearSeed } from './services/academic-year.seed';
import { AdminSeed } from './services/admin.seed';
import { AttendanceTypeSeed } from './services/attendance-type.seed';
import { AttendanceSeed } from './services/attendance.seed';
import { ClassSeed } from './services/class.seed';
import { DocumentTypeSeed } from './services/document-type.seed';
import { EnrollmentSeed } from './services/enrollment.seed';
import { GenderSeed } from './services/gender.seed';
import { GradeSeed } from './services/grade.seed';
import { LevelSeed } from './services/level.seed';
import { PermissionSeed } from './services/permission.seed';
import { RelationshipTypeSeed } from './services/relationship-type.seed';
import { RoleSeed } from './services/role.seed';
import { SeedService } from './services/seed.service';
import { StudentSeed } from './services/student.seed';

@Module({
  providers: [
    SeedService,
    ClassSeed,
    DocumentTypeSeed,
    GenderSeed,
    AttendanceTypeSeed,
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
    TypeOrmModule.forFeature([
      AcademicYear,
      Class,
      Grade,
      Level,
      Enrollment,
      Person,
      Student,
    ]),
  ],
  exports: [SeedService],
})
export class SeedModule {}
