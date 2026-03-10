import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AcademicYearSeed } from './academic-year.seed';
import { AdminSeed } from './admin.seed';
import { AttendanceTypeSeed } from './attendance-type.seed';
import { AttendanceSeed } from './attendance.seed';
import { ClassroomSeed } from './classroom.seed';
import { DocumentTypeSeed } from './document-type.seed';
import { EnrollmentSeed } from './enrollment.seed';
import { GenderSeed } from './gender.seed';
import { PermissionSeed } from './permission.seed';
import { RelationshipTypeSeed } from './relationship-type.seed';
import { RoleSeed } from './role.seed';
import { StudentSeed } from './student.seed';

@Injectable()
export class SeedService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly documentTypeSeed: DocumentTypeSeed,
    private readonly genderSeed: GenderSeed,
    private readonly attendanceTypeSeed: AttendanceTypeSeed,
    private readonly relationshipTypeSeed: RelationshipTypeSeed,
    private readonly roleSeed: RoleSeed,
    private readonly permissionSeed: PermissionSeed,
    private readonly academicYearSeed: AcademicYearSeed,
    private readonly classroomSeed: ClassroomSeed,
    private readonly studentSeed: StudentSeed,
    private readonly enrollmentSeed: EnrollmentSeed,
    private readonly attendanceSeed: AttendanceSeed,
    private readonly adminSeed: AdminSeed,
  ) {}

  async runSeed() {
    await this.dropAllTables();
    await this.documentTypeSeed.run();
    await this.genderSeed.run();
    await this.attendanceTypeSeed.run();
    await this.relationshipTypeSeed.run();
    await this.permissionSeed.run();
    await this.roleSeed.run();
    await this.academicYearSeed.run();
    await this.classroomSeed.run();
    await this.studentSeed.run();
    await this.enrollmentSeed.run();
    await this.adminSeed.run();
    await this.attendanceSeed.run();
  }

  async dropAllTables(): Promise<void> {
    await this.dataSource.dropDatabase();
    await this.dataSource.synchronize();
  }
}
