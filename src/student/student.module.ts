import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { Role } from 'src/auth/entities/role.entity';
import { User } from 'src/auth/entities/user.entity';
import { ClassroomModule } from 'src/classroom/classroom.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { StudentController } from './controllers/student.controller';
import { Student } from './entities/student.entity';
import { ImportService } from './services/import.service';
import { StudentService } from './services/student.service';

@Module({
  controllers: [StudentController],
  providers: [StudentService, ImportService],
  imports: [
    TypeOrmModule.forFeature([Student, Person, User, Role, PersonRole]),
    EnrollmentModule,
    ClassroomModule,
    AcademicYearModule,
  ],
  exports: [StudentService],
})
export class StudentModule {}
