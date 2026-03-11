import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassController } from './controllers/class.controller';
import { Class } from './entities/class.entity';
import { ClassService } from './services/class.service';

@Module({
  imports: [TypeOrmModule.forFeature([Class])],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService, TypeOrmModule],
})
export class ClassModule {}
