import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEmployeeDto, CreateEmployeeTypeDto } from '../dto/employee.dto';
import {
  UpdateEmployeeDto,
  UpdateEmployeeTypeDto,
} from '../dto/update-employee.dto';
import { EmployeeService } from '../services/employee.service';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Employee Type Endpoints
  @Post('type')
  createType(@Body() createEmployeeTypeDto: CreateEmployeeTypeDto) {
    return this.employeeService.createType(createEmployeeTypeDto);
  }

  @Get('type')
  findAllTypes() {
    return this.employeeService.findAllTypes();
  }

  @Get('type/:id')
  findOneType(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOneType(id);
  }

  @Patch('type/:id')
  updateType(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeTypeDto: UpdateEmployeeTypeDto,
  ) {
    return this.employeeService.updateType(id, updateEmployeeTypeDto);
  }

  // Employee Endpoints
  @Post('create')
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.remove(id);
  }

  @Get('role/:role')
  findByRole(@Param('role') role: string) {
    return this.employeeService.findByType(role);
  }
}
