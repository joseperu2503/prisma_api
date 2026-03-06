import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';

import { PersonController } from './controllers/person.controller';
import { PersonService } from './services/person.service';

@Module({
  controllers: [PersonController],
  providers: [PersonService],
  imports: [TypeOrmModule.forFeature([Person])],
  exports: [PersonService],
})
export class PersonModule {}
