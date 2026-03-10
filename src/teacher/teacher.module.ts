import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/auth/entities/role.entity';
import { User } from 'src/auth/entities/user.entity';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { PersonModule } from 'src/person/person.module';
import { TeacherController } from './controllers/teacher.controller';
import { Teacher } from './entities/teacher.entity';
import { TeacherService } from './services/teacher.service';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService],
  imports: [
    TypeOrmModule.forFeature([Teacher, Person, User, Role, PersonRole]),
    PersonModule,
  ],
  exports: [TeacherService],
})
export class TeacherModule {}
