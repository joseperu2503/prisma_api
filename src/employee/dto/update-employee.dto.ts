import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto, CreateEmployeeTypeDto } from './employee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
export class UpdateEmployeeTypeDto extends PartialType(CreateEmployeeTypeDto) {}
