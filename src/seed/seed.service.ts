import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth.service';
import { DataSource } from 'typeorm';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}

  async runSeed() {
    // await this.dropAllTables();
    // await this.userSeed();
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
