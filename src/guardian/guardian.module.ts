import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guardian } from './entities/guardian.entity';
import { StudentGuardian } from './entities/student-guardian.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Guardian, StudentGuardian])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class GuardianModule {}
