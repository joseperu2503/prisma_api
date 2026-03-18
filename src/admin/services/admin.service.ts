import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/entities/role.entity';
import { User } from 'src/auth/entities/user.entity';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { PersonService } from 'src/person/services/person.service';
import { DataSource, Repository } from 'typeorm';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { ListAdminDto } from '../dto/list-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(PersonRole)
    private readonly personRoleRepository: Repository<PersonRole>,

    private readonly dataSource: DataSource,
    private readonly personService: PersonService,
  ) {}

  async create(dto: CreateAdminDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { person: personDto, password } = dto;

      const person = await this.personService.updateOrCreatePerson(
        personDto,
        queryRunner,
      );

      let user = await queryRunner.manager.findOne(User, {
        where: { personId: person.id },
      });

      if (!user) {
        user = queryRunner.manager.create(User, {
          personId: person.id,
          password: bcrypt.hashSync(password ?? person.documentNumber, 10),
        });
        user = await queryRunner.manager.save(user);
      }

      const adminRole = await queryRunner.manager.findOne(Role, {
        where: { id: RoleId.ADMIN },
      });

      if (!adminRole) {
        throw new NotFoundException(`Role 'ADMIN' not found. Run seed first.`);
      }

      const existingPersonRole = await queryRunner.manager.findOne(PersonRole, {
        where: { personId: person.id, roleId: adminRole.id },
      });

      if (!existingPersonRole) {
        const personRole = queryRunner.manager.create(PersonRole, {
          personId: person.id,
          roleId: adminRole.id,
        });
        await queryRunner.manager.save(personRole);
      }

      await queryRunner.commitTransaction();

      return {
        id: user.id,
        success: true,
        message: 'Administrador creado exitosamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Error al crear el administrador',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(params: ListAdminDto) {
    const { pagination, search } = params;
    const page = pagination?.page;
    const limit = pagination?.limit;

    const qb = this.userRepository
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.person', 'p')
      .innerJoinAndSelect('p.personRoles', 'pr')
      .innerJoinAndSelect('pr.role', 'r', 'r.id = :id', {
        id: RoleId.ADMIN,
      })
      .orderBy('p.paternalLastName', 'ASC')
      .addOrderBy('p.names', 'ASC');

    if (search) {
      qb.where(
        'LOWER(p.names) LIKE :search OR LOWER(p.paternalLastName) LIKE :search OR LOWER(p.maternalLastName) LIKE :search OR p.documentNumber LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    let data: any[];
    let total: number;

    if (page && limit) {
      total = await qb.getCount();
      data = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
    } else {
      data = await qb.getMany();
      total = data.length;
    }

    const mapped = data.map((u) => ({
      ...u,
      isActive: u.person.personRoles[0]?.isActive ?? true,
    }));

    return {
      data: mapped,
      total,
      pagination: page && limit ? { page, limit } : undefined,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { person: { personRoles: { role: true } } },
    });

    if (!user) {
      throw new NotFoundException(`Administrador no encontrado`);
    }

    const adminPersonRole = user.person.personRoles.find(
      (pr) => pr.role?.id === RoleId.ADMIN,
    );

    return { ...user, isActive: adminPersonRole?.isActive ?? true };
  }

  async resetAllPasswords() {
    const users = await this.userRepository.find({ relations: { person: true } });

    await Promise.all(
      users.map((user) =>
        this.userRepository.update(user.id, {
          password: bcrypt.hashSync(user.person.documentNumber, 10),
        }),
      ),
    );

    return {
      success: true,
      count: users.length,
      message: `${users.length} contraseñas restablecidas al número de documento.`,
    };
  }

  async toggleActive(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { person: { personRoles: { role: true } } },
    });

    if (!user) {
      throw new NotFoundException(`Administrador no encontrado`);
    }

    const adminPersonRole = user.person.personRoles.find(
      (pr) => pr.role?.id === RoleId.ADMIN,
    );

    if (!adminPersonRole) {
      throw new NotFoundException(`Rol de administrador no encontrado`);
    }

    adminPersonRole.isActive = !adminPersonRole.isActive;
    await this.personRoleRepository.save(adminPersonRole);

    return {
      id: user.id,
      isActive: adminPersonRole.isActive,
      message: adminPersonRole.isActive
        ? 'Administrador activado'
        : 'Administrador desactivado',
    };
  }
}
