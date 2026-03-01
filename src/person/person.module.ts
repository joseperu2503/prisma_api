import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';

@Module({
  controllers: [],
  providers: [],
  imports: [TypeOrmModule.forFeature([Person])],
  exports: [],
})
export class PersonModule {}
