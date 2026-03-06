import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomController } from './controllers/classroom.controller';
import { Classroom } from './entities/classroom.entity';
import { ClassroomService } from './services/classroom.service';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom])],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService, TypeOrmModule],
})
export class ClassroomModule {}
