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
import { PersonService } from 'src/person/services/person.service';
import { DataSource, Repository } from 'typeorm';
import { CreateEmployeeDto } from '../dto/employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly personService: PersonService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateEmployeeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { person: personDto, roleId, isActive } = dto;

      // 1. Validar rol (debe ser isEmployee)
      const role = await queryRunner.manager.findOne(Role, {
        where: { id: roleId },
      });
      if (!role) {
        throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
      }
      if (!role.isEmployee) {
        throw new HttpException(
          { success: false, message: `El rol '${role.name}' no es un rol de empleado` },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Resolver/crear persona
      const person = await this.personService.updateOrCreatePerson(personDto, queryRunner);

      // 3. Resolver/crear usuario (contraseña = número de documento)
      let user = await queryRunner.manager.findOne(User, {
        where: { personId: person.id },
      });
      if (!user) {
        user = queryRunner.manager.create(User, {
          personId: person.id,
          password: bcrypt.hashSync(personDto.documentNumber, 10),
        });
        user = await queryRunner.manager.save(user);
      }

      // 4. Asignar rol a la persona
      const existingPersonRole = await queryRunner.manager.findOne(PersonRole, {
        where: { personId: person.id, roleId: role.id },
      });
      if (!existingPersonRole) {
        const personRole = queryRunner.manager.create(PersonRole, {
          personId: person.id,
          roleId: role.id,
        });
        await queryRunner.manager.save(personRole);
      }

      // 5. Validar unicidad persona-rol en employees
      const existing = await queryRunner.manager.findOne(Employee, {
        where: { personId: person.id, roleId: role.id },
      });
      if (existing) {
        throw new ConflictException(
          `Esta persona ya está registrada como ${role.name}`,
        );
      }

      // 6. Crear employee
      const employee = queryRunner.manager.create(Employee, {
        personId: person.id,
        roleId: role.id,
        isActive: isActive ?? true,
      });
      const saved = await queryRunner.manager.save(employee);

      await queryRunner.commitTransaction();
      return { id: saved.id, success: true, message: 'Colaborador creado correctamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, message: 'Error al crear el colaborador', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAllPaginated(page: number, limit: number, search?: string) {
    const qb = this.employeeRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.person', 'p')
      .leftJoinAndSelect('e.role', 'r')
      .orderBy('p.paternalLastName', 'ASC')
      .addOrderBy('p.names', 'ASC');

    if (search) {
      qb.where(
        'LOWER(p.names) LIKE :s OR LOWER(p.paternalLastName) LIKE :s OR LOWER(p.maternalLastName) LIKE :s OR p.documentNumber LIKE :s',
        { s: `%${search.toLowerCase()}%` },
      );
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: { person: true, role: true },
    });
    if (!employee) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado`);
    }
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);
    Object.assign(employee, dto);
    return this.employeeRepository.save(employee);
  }

  async toggleActive(id: string) {
    const employee = await this.findOne(id);
    employee.isActive = !employee.isActive;
    return this.employeeRepository.save(employee);
  }

  async remove(id: string) {
    const employee = await this.findOne(id);
    return this.employeeRepository.remove(employee);
  }
}
