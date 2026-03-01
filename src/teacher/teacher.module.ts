import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';

@Module({
  controllers: [],
  providers: [],
  imports: [TypeOrmModule.forFeature([Teacher])],
  exports: [],
})
export class TeacherModule {}
