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
import { RoleId } from 'src/auth/enums/role-id.enum';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { PersonService } from 'src/person/services/person.service';
import { DataSource, Repository } from 'typeorm';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { EmployeeType } from '../entities/employee-type.entity';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(PersonRole)
    private readonly personRoleRepository: Repository<PersonRole>,

    private readonly personService: PersonService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateEmployeeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { person: personDto, employeeTypeId } = dto;

      // 1. Validar tipo de empleado
      const employeeType = await this.dataSource
        .getRepository(EmployeeType)
        .findOne({ where: { id: employeeTypeId } });

      if (!employeeType) {
        throw new NotFoundException(
          `Tipo de empleado con id ${employeeTypeId} no encontrado`,
        );
      }

      // 2. Resolver/crear persona
      const person = await this.personService.findOrCreate(
        personDto,
        queryRunner,
      );

      // 3. Resolver/crear usuario (contraseña = número de documento)
      let user = await queryRunner.manager.findOne(User, {
        where: { personId: person.id },
      });
      if (!user) {
        user = queryRunner.manager.create(User, {
          personId: person.id,
          password: bcrypt.hashSync(person.documentNumber, 10),
        });
        user = await queryRunner.manager.save(user);
      }

      // 4. Asignar rol a la persona
      const existingPersonRole = await queryRunner.manager.findOne(PersonRole, {
        where: { personId: person.id, roleId: RoleId.EMPLOYEE },
      });

      if (!existingPersonRole) {
        const personRole = queryRunner.manager.create(PersonRole, {
          personId: person.id,
          roleId: RoleId.EMPLOYEE,
        });
        await queryRunner.manager.save(personRole);
      }

      // 5. Validar unicidad persona-rol en employees
      const existing = await queryRunner.manager.findOne(Employee, {
        where: { personId: person.id, employeeTypeId: employeeType.id },
      });

      if (existing) {
        throw new ConflictException(
          `Esta persona ya está registrada como ${employeeType.name}`,
        );
      }

      // 6. Crear employee
      const employee = queryRunner.manager.create(Employee, {
        personId: person.id,
        employeeTypeId: employeeType.id,
      });
      const saved = await queryRunner.manager.save(employee);

      await queryRunner.commitTransaction();
      return {
        id: saved.id,
        success: true,
        message: 'Colaborador creado correctamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          success: false,
          message: 'Error al crear el colaborador',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: { person: { personRoles: true }, role: true },
    });
    if (!employee) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado`);
    }

    const personRole = employee.person.personRoles.find(
      (pr) => pr.roleId === RoleId.EMPLOYEE,
    );

    return { ...employee, isActive: personRole?.isActive ?? true };
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: { person: true },
    });
    if (!employee) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado`);
    }
    Object.assign(employee, dto);
    return this.employeeRepository.save(employee);
  }

  async toggleActive(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado`);
    }

    const personRole = await this.personRoleRepository.findOne({
      where: { personId: employee.personId, roleId: RoleId.EMPLOYEE },
    });

    if (!personRole) {
      throw new NotFoundException(`Rol de colaborador no encontrado`);
    }

    personRole.isActive = !personRole.isActive;
    await this.personRoleRepository.save(personRole);

    return { ...employee, isActive: personRole.isActive };
  }

  async remove(id: string) {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(PersonRole, {
        personId: employee.personId,
        roleId: RoleId.EMPLOYEE,
      });

      await queryRunner.manager.remove(Employee, employee);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          success: false,
          message: 'Error al eliminar el colaborador',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
