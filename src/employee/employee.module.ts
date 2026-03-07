import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PersonModule } from 'src/person/person.module';
import { EmployeeController } from './controllers/employee.controller';
import { Employee } from './entities/employee.entity';
import { EmployeeService } from './services/employee.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), PersonModule, AuthModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService, TypeOrmModule],
})
export class EmployeeModule {}
