import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/auth/entities/user.entity';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { DataSource, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
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
    return await this.dataSource.transaction(async (manager) => {
      try {
        const { personId, newPerson, employeeTypeId, password, isActive } =
          createEmployeeDto;

        // 1️⃣ Validar el tipo de empleado (por ID o por Code)
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            employeeTypeId,
          );

        const type = await manager.findOne(EmployeeType, {
          where: isUuid ? { id: employeeTypeId } : { code: employeeTypeId },
        });

        if (!type) {
          throw new NotFoundException(
            `Employee type with ID ${employeeTypeId} not found`,
          );
        }

        let person: Person | null = null;

        // 2️⃣ Resolver Persona
        if (personId) {
          person = await manager.findOne(Person, {
            where: { id: personId },
          });
          if (!person) {
            throw new NotFoundException(`Person with ID ${personId} not found`);
          }
        } else if (newPerson) {
          // Validar si ya existe una persona con el mismo documento
          const existingPerson = await manager.findOne(Person, {
            where: {
              documentTypeId: newPerson.documentTypeId,
              documentNumber: newPerson.documentNumber,
            },
          });

          if (existingPerson) {
            person = existingPerson;
          } else {
            person = manager.create(Person, {
              ...newPerson,
            });
            person = await manager.save(person);
          }
        } else {
          throw new HttpException(
            {
              success: false,
              message: 'Debe enviar personId o datos para newPerson',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        // 3️⃣ Resolver/Crear Usuario
        let user = await manager.findOne(User, {
          where: { personId: person.id },
        });

        if (!user) {
          user = manager.create(User, {
            personId: person.id,
            password: bcrypt.hashSync(password, 10),
          });
          user = await manager.save(user);
        }

        // 4️⃣ Asignar Rol de Empleado a la PERSONA
        const existingRole = await manager.findOne(PersonRole, {
          where: { personId: person.id, roleId: 'EMPLOYEE' },
        });

        if (!existingRole) {
          const personRole = manager.create(PersonRole, {
            personId: person.id,
            roleId: 'EMPLOYEE',
          });
          await manager.save(personRole);
        }

        // 4️⃣.5️⃣ Validar combinación única Persona-Tipo
        const existingEmployee = await manager.findOne(Employee, {
          where: { personId: person.id, employeeTypeId: type.id },
        });

        if (existingEmployee) {
          throw new ConflictException(
            `Esta persona ya está registrada como ${type.name}`,
          );
        }

        // 5️⃣ Crear Empleado
        const employee = manager.create(Employee, {
          personId: person.id,
          employeeTypeId: type.id,
          isActive: isActive,
        });

        const savedEmployee = await manager.save(employee);

        return {
          id: savedEmployee.id,
          success: true,
          message: 'Employee created successfully',
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          {
            success: false,
            message: 'An error occurred while creating the employee',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
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
