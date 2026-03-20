import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/auth/entities/role.entity';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { PersonModule } from 'src/person/person.module';
import { Student } from 'src/student/entities/student.entity';
import { GuardianController } from './controllers/guardian.controller';
import { Guardian } from './entities/guardian.entity';
import { StudentGuardian } from './entities/student-guardian.entity';
import { GuardianService } from './services/guardian.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Guardian,
      StudentGuardian,
      Person,
      PersonRole,
      Role,
      Student,
    ]),
    PersonModule,
    AuthModule,
  ],
  controllers: [GuardianController],
  providers: [GuardianService],
  exports: [GuardianService, TypeOrmModule],
})
export class GuardianModule {}
