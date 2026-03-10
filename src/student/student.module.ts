import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { Role } from 'src/auth/entities/role.entity';
import { User } from 'src/auth/entities/user.entity';
import { GradeModule } from 'src/grade/grade.module';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { PersonModule } from 'src/person/person.module';
import { StudentController } from './controllers/student.controller';
import { Student } from './entities/student.entity';
import { StudentService } from './services/student.service';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [
    TypeOrmModule.forFeature([Student, Person, User, Role, PersonRole]),
    GradeModule,
    AcademicYearModule,
    PersonModule,
  ],
  exports: [StudentService],
})
export class StudentModule {}
