import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicProgramController } from './controllers/academic-program.controller';
import { AcademicProgram } from './entities/academic-program.entity';
import { AcademicProgramService } from './services/academic-program.service';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicProgram])],
  controllers: [AcademicProgramController],
  providers: [AcademicProgramService],
  exports: [AcademicProgramService, TypeOrmModule],
})
export class AcademicProgramModule {}
