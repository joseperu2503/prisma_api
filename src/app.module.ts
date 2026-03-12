import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPeriodModule } from './academic-period/academic-period.module';
import { AcademicYearModule } from './academic-year/academic-year.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { ClassModule } from './class/class.module';
import { CommonModule } from './common/common.module';
import { EmployeeModule } from './employee/employee.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { GradeModule } from './grade/grade.module';
import { GuardianModule } from './guardian/guardian.module';
import { LevelModule } from './level/level.module';
import { PersonModule } from './person/person.module';
import { PlatformVersionMiddleware } from './platform-version/middleware/platform-version.middleware';
import { PlatformVersionModule } from './platform-version/platform-version.module';
import { SeedCommand } from './seed/commands/seed.command';
import { SeedModule } from './seed/seed.module';
import { StudentModule } from './student/student.module';
import { SubjectModule } from './subject/subject.module';
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
    ClassModule,
    SubjectModule,
    EnrollmentModule,
    PlatformVersionModule,
  ],
  providers: [SeedCommand],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PlatformVersionMiddleware)
      .exclude(
        '/api/seed(.*)',
        // Platform-version management routes — excluded (no header check needed)
        { path: '/api/platform-versions', method: RequestMethod.GET },
        { path: '/api/platform-versions', method: RequestMethod.POST },
        { path: '/api/platform-versions/types', method: RequestMethod.GET },
        { path: '/api/platform-versions/:id', method: RequestMethod.GET },
        { path: '/api/platform-versions/:id', method: RequestMethod.PATCH },
        { path: '/api/platform-versions/:id', method: RequestMethod.DELETE },
        {
          path: '/api/platform-versions/:id/toggle-active',
          method: RequestMethod.PATCH,
        },
        '/api/privacy-policy(.*)',
      )
      .forRoutes('*');
  }
}
