import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { PersonModule } from './person/person.module';
import { SeedCommand } from './seed/seed.command';
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
    StudentModule,
    TeacherModule,
    CommonModule,
    AttendanceModule,
  ],
  providers: [SeedCommand],
})
export class AppModule {}
