import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearModule } from 'src/academic-year/academic-year.module';
import { LevelModule } from 'src/level/level.module';
import { GradeController } from './controllers/grade.controller';
import { GradeYear } from './entities/grade-year.entity';
import { Grade } from './entities/grade.entity';
import { GradeService } from './services/grade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade, GradeYear]),
    AcademicYearModule,
    LevelModule,
  ],
  controllers: [GradeController],
  providers: [GradeService],
  exports: [GradeService, TypeOrmModule],
})
export class GradeModule {}
