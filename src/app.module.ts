import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPeriodModule } from './academic-period/academic-period.module';
import { AcademicProgramModule } from './academic-program/academic-program.module';
import { AcademicYearModule } from './academic-year/academic-year.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { EmployeeModule } from './employee/employee.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { GradeModule } from './grade/grade.module';
import { GuardianModule } from './guardian/guardian.module';
import { LevelModule } from './level/level.module';
import { PersonModule } from './person/person.module';
import { SeedCommand } from './seed/commands/seed.command';
import { SeedModule } from './seed/seed.module';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    SeedModule,
    AuthModule,
    PersonModule,
    AdminModule,
    StudentModule,
    TeacherModule,
    GuardianModule,
    EmployeeModule,
    CommonModule,
    AttendanceModule,
    LevelModule,
    GradeModule,
    AcademicYearModule,
    AcademicPeriodModule,
    AcademicProgramModule,
    EnrollmentModule,
  ],
  providers: [SeedCommand],
})
export class AppModule {}
