import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Person } from 'src/person/entities/person.entity';
import { StudentController } from './controllers/student.controller';
import { Student } from './entities/student.entity';
import { StudentService } from './services/student.service';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [TypeOrmModule.forFeature([Student, Person, User])],
  exports: [StudentService],
})
export class StudentModule {}
