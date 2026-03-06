import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth.service';
import { DataSource } from 'typeorm';
import { AcademicYearSeed } from './academic-year.seed';
import { AttendanceTypeSeed } from './attendance-type.seed';
import { ClassroomSeed } from './classroom.seed';
import { DocumentTypeSeed } from './document-type.seed';
import { EmployeeTypeSeed } from './employee-type.seed';
import { GenderSeed } from './gender.seed';
import { RelationshipTypeSeed } from './relationship-type.seed';
import { RoleSeed } from './role.seed';

@Injectable()
export class SeedService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
    private readonly documentTypeSeed: DocumentTypeSeed,
    private readonly genderSeed: GenderSeed,
    private readonly attendanceTypeSeed: AttendanceTypeSeed,
    private readonly employeeTypeSeed: EmployeeTypeSeed,
    private readonly relationshipTypeSeed: RelationshipTypeSeed,
    private readonly roleSeed: RoleSeed,
    private readonly academicYearSeed: AcademicYearSeed,
    private readonly classroomSeed: ClassroomSeed,
  ) {}

  async runSeed() {
    await this.dropAllTables();
    await this.documentTypeSeed.run();
    await this.genderSeed.run();
    await this.attendanceTypeSeed.run();
    await this.relationshipTypeSeed.run();
    await this.roleSeed.run();
    await this.employeeTypeSeed.run();
    // await this.academicYearSeed.run();
    // await this.classroomSeed.run();
  }

  async dropAllTables(): Promise<void> {
    await this.dataSource.dropDatabase();
    await this.dataSource.synchronize();
  }
}
