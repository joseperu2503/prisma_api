import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeType } from 'src/employee/entities/employee-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeeTypeSeed {
  constructor(
    @InjectRepository(EmployeeType)
    private readonly employeeTypeRepository: Repository<EmployeeType>,
  ) {}

  employeeTypes = [
    { code: 'teacher', name: 'Profesor' },
    { code: 'secretary', name: 'Secretaria' },
  ];

  async run() {
    for (const type of this.employeeTypes) {
      await this.create(type);
    }
  }

  async create(params: { code: string; name: string }) {
    const { code, name } = params;

    const existingType = await this.employeeTypeRepository.findOne({
      where: { code },
    });

    if (existingType) {
      existingType.name = name;
      return await this.employeeTypeRepository.save(existingType);
    } else {
      const newType = this.employeeTypeRepository.create(params);
      return await this.employeeTypeRepository.save(newType);
    }
  }
}
