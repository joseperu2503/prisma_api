import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/auth/entities/role.entity';
import { PersonRole } from './entities/person-role.entity';
import { Person } from './entities/person.entity';

import { PersonController } from './controllers/person.controller';
import { PersonService } from './services/person.service';

@Module({
  controllers: [PersonController],
  providers: [PersonService],
  imports: [TypeOrmModule.forFeature([Person, PersonRole, Role])],
  exports: [PersonService],
})
export class PersonModule {}
