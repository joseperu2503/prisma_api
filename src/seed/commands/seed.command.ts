import { Command, CommandRunner } from 'nest-commander';
import { SeedService } from '../services/seed.service';

@Command({ name: 'seed', description: 'Run seed data' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly seedService: SeedService) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.seedService.runSeed();
      console.log('Seed executed successfully');
    } catch (error) {
      console.log(error);
    }
  }
}
