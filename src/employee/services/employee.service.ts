import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto, CreateEmployeeTypeDto } from '../dto/employee.dto';
import {
  UpdateEmployeeDto,
  UpdateEmployeeTypeDto,
} from '../dto/update-employee.dto';
import { EmployeeType } from '../entities/employee-type.entity';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeType)
    private readonly employeeTypeRepository: Repository<EmployeeType>,
  ) {}

  // Employee Type Methods
  async createType(createEmployeeTypeDto: CreateEmployeeTypeDto) {
    const existingType = await this.employeeTypeRepository.findOne({
      where: { name: createEmployeeTypeDto.name },
    });
    if (existingType) {
      throw new ConflictException(
        `Employee type '${createEmployeeTypeDto.name}' already exists`,
      );
    }
    const type = this.employeeTypeRepository.create(createEmployeeTypeDto);
    return await this.employeeTypeRepository.save(type);
  }

  async findAllTypes() {
    return await this.employeeTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOneType(id: string) {
    const type = await this.employeeTypeRepository.findOneBy({ id });
    if (!type) {
      throw new NotFoundException(`Employee type with ID ${id} not found`);
    }
    return type;
  }

  async updateType(id: string, updateEmployeeTypeDto: UpdateEmployeeTypeDto) {
    const type = await this.findOneType(id);
    const updatedType = this.employeeTypeRepository.merge(
      type,
      updateEmployeeTypeDto,
    );
    return await this.employeeTypeRepository.save(updatedType);
  }

  // Employee Methods
  async create(createEmployeeDto: CreateEmployeeDto) {
    await this.findOneType(createEmployeeDto.employeeTypeId);
    // You might want to check if the person exists here as well
    const employee = this.employeeRepository.create(createEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  async findAll() {
    return await this.employeeRepository.find({
      relations: {
        person: true,
        employeeType: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: {
        person: true,
        employeeType: true,
      },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);
    if (updateEmployeeDto.employeeTypeId) {
      await this.findOneType(updateEmployeeDto.employeeTypeId);
    }
    const updatedEmployee = this.employeeRepository.merge(
      employee,
      updateEmployeeDto,
    );
    return await this.employeeRepository.save(updatedEmployee);
  }

  async remove(id: string) {
    const employee = await this.findOne(id);
    return await this.employeeRepository.remove(employee);
  }

  async findByType(typeName: string) {
    return await this.employeeRepository.find({
      where: { employeeType: { name: typeName } },
      relations: {
        person: true,
        employeeType: true,
      },
    });
  }
}
