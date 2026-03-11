import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectController } from './controllers/subject.controller';
import { Subject } from './entities/subject.entity';
import { SubjectService } from './services/subject.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subject])],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService, TypeOrmModule],
})
export class SubjectModule {}
