import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { PersonModule } from 'src/person/person.module';
import { EmployeeController } from './controllers/employee.controller';
import { EmployeeType } from './entities/employee-type.entity';
import { Employee } from './entities/employee.entity';
import { EmployeeService } from './services/employee.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, PersonRole, EmployeeType]),
    PersonModule,
    AuthModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService, TypeOrmModule],
})
export class EmployeeModule {}
