import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/auth/entities/role.entity';
import { User } from 'src/auth/entities/user.entity';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { PersonModule } from 'src/person/person.module';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [
    TypeOrmModule.forFeature([User, Person, Role, PersonRole]),
    PersonModule,
  ],
  exports: [AdminService],
})
export class AdminModule {}
