import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ClientType } from 'src/auth/enums/client-type.enum';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { EmployeeService } from '../services/employee.service';
@Auth([RoleId.ADMIN], [ClientType.WEB])
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.toggleActive(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.remove(id);
  }
}
