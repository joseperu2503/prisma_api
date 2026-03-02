import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { SeedService } from './seed.service';
import { DocumentTypeSeed } from './services/document-type.seed';
import { GenderSeed } from './services/gender.seed';

@Module({
  providers: [SeedService, DocumentTypeSeed, GenderSeed],
  imports: [AuthModule, CommonModule],
  exports: [SeedService],
})
export class SeedModule {}
