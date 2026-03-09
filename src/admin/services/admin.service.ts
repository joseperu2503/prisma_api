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
import { PersonRole } from 'src/person/entities/person-role.entity';
import { PersonService } from 'src/person/services/person.service';
import { DataSource, Repository } from 'typeorm';
import { CreateAdminDto } from '../dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

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
        where: { code: 'ADMIN' },
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

  async findAllPaginated(page: number, limit: number, search?: string) {
    const qb = this.userRepository
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.person', 'p')
      .innerJoin('p.personRoles', 'pr')
      .innerJoin('pr.role', 'r', 'r.code = :code', { code: 'ADMIN' })
      .orderBy('p.paternalLastName', 'ASC')
      .addOrderBy('p.names', 'ASC');

    if (search) {
      qb.where(
        'LOWER(p.names) LIKE :search OR LOWER(p.paternalLastName) LIKE :search OR LOWER(p.maternalLastName) LIKE :search OR p.documentNumber LIKE :search',
        { search: `%${search.toLowerCase()}%` },
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
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { person: true },
    });

    if (!user) {
      throw new NotFoundException(`Administrador no encontrado`);
    }

    return user;
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    await this.userRepository.save(user);
    return {
      id: user.id,
      isActive: user.isActive,
      message: user.isActive ? 'Administrador activado' : 'Administrador desactivado',
    };
  }
}
