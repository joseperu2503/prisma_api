import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth.service';
import { DataSource } from 'typeorm';
import { initialData } from './data/seed-data';
import { AttendanceTypeSeed } from './services/attendance-type.seed';
import { DocumentTypeSeed } from './services/document-type.seed';
import { EmployeeTypeSeed } from './services/employee-type.seed';
import { GenderSeed } from './services/gender.seed';

@Injectable()
export class SeedService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
    private readonly documentTypeSeed: DocumentTypeSeed,
    private readonly genderSeed: GenderSeed,
    private readonly attendanceTypeSeed: AttendanceTypeSeed,
    private readonly employeeTypeSeed: EmployeeTypeSeed,
  ) {}

  async runSeed() {
    await this.dropAllTables();
    // await this.userSeed();
    await this.documentTypeSeed.run();
    await this.genderSeed.run();
    await this.attendanceTypeSeed.run();
    await this.employeeTypeSeed.run();
  }

  private async userSeed() {
    const users = initialData.users;
    for (const user of users) {
      await this.authService.register(user);
    }
  }

  async dropAllTables(): Promise<void> {
    await this.dataSource.dropDatabase();
    await this.dataSource.synchronize();
  }
}
