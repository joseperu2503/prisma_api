import { Module } from '@nestjs/common';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { AuthModule } from 'src/auth/auth.module';
import { ClassroomModule } from 'src/classroom/classroom.module';
import { CommonModule } from 'src/common/common.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { AcademicYearSeed } from './services/academic-year.seed';
import { AttendanceTypeSeed } from './services/attendance-type.seed';
import { ClassroomSeed } from './services/classroom.seed';
import { DocumentTypeSeed } from './services/document-type.seed';
import { EmployeeTypeSeed } from './services/employee-type.seed';
import { GenderSeed } from './services/gender.seed';
import { SeedService } from './services/seed.service';

@Module({
  providers: [
    SeedService,
    DocumentTypeSeed,
    GenderSeed,
    AttendanceTypeSeed,
    EmployeeTypeSeed,
    AcademicYearSeed,
    ClassroomSeed,
  ],
  imports: [
    AuthModule,
    CommonModule,
    AttendanceModule,
    EmployeeModule,
    AcademicYearModule,
    ClassroomModule,
  ],
  exports: [SeedService],
})
export class SeedModule {}
