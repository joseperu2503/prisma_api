import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { ClassroomController } from './controllers/classroom.controller';
import { ClassroomYear } from './entities/classroom-year.entity';
import { Classroom } from './entities/classroom.entity';
import { ClassroomService } from './services/classroom.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classroom, ClassroomYear]),
    AcademicYearModule,
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService, TypeOrmModule],
})
export class ClassroomModule {}
