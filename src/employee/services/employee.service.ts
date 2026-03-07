import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/entities/role.entity';
import { User } from 'src/auth/entities/user.entity';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateEmployeeDto } from '../dto/employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly dataSource: DataSource,
  ) {}

  // Employee Methods
  async create(createEmployeeDto: CreateEmployeeDto) {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const { personId, newPerson, roleId, password, isActive } =
          createEmployeeDto;

        // 1️⃣ Validar el Rol (debe ser un rol de empleado)

        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            roleId,
          );

        const role = await manager.findOne(Role, {
          where: isUuid ? { id: roleId } : { code: roleId },
        });

        if (!role) {
          throw new NotFoundException(
            `Role with ID or Code ${roleId} not found`,
          );
        }

        if (!role.isEmployee) {
          throw new HttpException(
            {
              success: false,
              message: `El rol '${role.name}' no está marcado como un rol de empleado`,
            },
            HttpStatus.BAD_REQUEST,
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

        const existingPersonRole = await manager.findOne(PersonRole, {
          where: { personId: person.id, roleId: role.id },
        });

        if (existingPersonRole) {
          throw new ConflictException(
            `Esta persona ya está registrada con el rol ${role.name}`,
          );
        }

        const personRole = manager.create(PersonRole, {
          personId: person.id,
          roleId: role.id,
        });

        await manager.save(personRole);

        // 4️⃣.5️⃣ Validar combinación única Persona-Rol
        const existingEmployee = await manager.findOne(Employee, {
          where: { personId: person.id, roleId: role.id },
        });

        if (existingEmployee) {
          throw new ConflictException(
            `Esta persona ya está registrada con el rol ${role.name}`,
          );
        }

        // 5️⃣ Crear Empleado
        const employee = manager.create(Employee, {
          personId: person.id,
          roleId: role.id,
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
        role: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: {
        person: true,
        role: true,
      },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);
    if (updateEmployeeDto.roleId) {
      const role = await this.roleRepository.findOneBy({
        id: updateEmployeeDto.roleId,
      });
      if (!role) {
        throw new NotFoundException(
          `Role with ID ${updateEmployeeDto.roleId} not found`,
        );
      }
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

  async findByRole(roleId: string) {
    return await this.employeeRepository.find({
      where: { roleId },
      relations: {
        person: true,
        role: true,
      },
    });
  }
}
