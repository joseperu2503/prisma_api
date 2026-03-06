import { Module } from '@nestjs/common';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { SeedService } from './seed.service';
import { AttendanceTypeSeed } from './services/attendance-type.seed';
import { DocumentTypeSeed } from './services/document-type.seed';
import { EmployeeTypeSeed } from './services/employee-type.seed';
import { GenderSeed } from './services/gender.seed';

@Module({
  providers: [
    SeedService,
    DocumentTypeSeed,
    GenderSeed,
    AttendanceTypeSeed,
    EmployeeTypeSeed,
  ],
  imports: [AuthModule, CommonModule, AttendanceModule, EmployeeModule],
  exports: [SeedService],
})
export class SeedModule {}
