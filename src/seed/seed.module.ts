import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { AttendanceDay } from 'src/attendance/entities/attendance-day.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ClassroomModule } from 'src/classroom/classroom.module';
import { Classroom } from 'src/classroom/entities/classroom.entity';
import { CommonModule } from 'src/common/common.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { StudentModule } from 'src/student/student.module';
import { AcademicYearSeed } from './services/academic-year.seed';
import { AttendanceSeed } from './services/attendance.seed';
import { AttendanceTypeSeed } from './services/attendance-type.seed';
import { ClassroomSeed } from './services/classroom.seed';
import { DocumentTypeSeed } from './services/document-type.seed';
import { EnrollmentSeed } from './services/enrollment.seed';
import { GenderSeed } from './services/gender.seed';
import { PermissionSeed } from './services/permission.seed';
import { RelationshipTypeSeed } from './services/relationship-type.seed';
import { RoleSeed } from './services/role.seed';
import { SeedService } from './services/seed.service';
import { StudentSeed } from './services/student.seed';

@Module({
  providers: [
    SeedService,
    DocumentTypeSeed,
    GenderSeed,
    AttendanceTypeSeed,
    AcademicYearSeed,
    ClassroomSeed,
    RelationshipTypeSeed,
    RoleSeed,
    PermissionSeed,
    StudentSeed,
    EnrollmentSeed,
    AttendanceSeed,
  ],
  imports: [
    AuthModule,
    CommonModule,
    AttendanceModule,
    EmployeeModule,
    AcademicYearModule,
    ClassroomModule,
    StudentModule,
    EnrollmentModule,
    TypeOrmModule.forFeature([AcademicYear, Classroom, Enrollment, Person, Student, AttendanceDay]),
  ],
  exports: [SeedService],
})
export class SeedModule {}
