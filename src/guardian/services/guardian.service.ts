import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/auth/entities/role.entity';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { PersonService } from 'src/person/services/person.service';
import { DataSource, Repository } from 'typeorm';
import { CreateGuardianDto } from '../dto/create-guardian.dto';
import { ListGuardianDto } from '../dto/list-guardian.dto';
import { UpdateGuardianDto } from '../dto/update-guardian.dto';
import { Guardian } from '../entities/guardian.entity';

@Injectable()
export class GuardianService {
  constructor(
    @InjectRepository(Guardian)
    private readonly guardianRepository: Repository<Guardian>,

    @InjectRepository(PersonRole)
    private readonly personRoleRepository: Repository<PersonRole>,

    private readonly dataSource: DataSource,
    private readonly personService: PersonService,
  ) {}

  async create(dto: CreateGuardianDto) {
    if (!dto.personId && !dto.person) {
      throw new BadRequestException(
        'Debe proporcionar personId o los datos de la nueva persona',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let person: Person;

      if (dto.personId) {
        const found = await queryRunner.manager.findOne(Person, {
          where: { id: dto.personId },
        });
        if (!found) throw new NotFoundException('Persona no encontrada');
        person = found;
      } else {
        person = await this.personService.createPerson(
          dto.person!,
          queryRunner,
        );
      }

      // Assign GUARDIAN role
      const guardianRole = await queryRunner.manager.findOne(Role, {
        where: { id: RoleId.GUARDIAN },
      });

      if (!guardianRole) {
        throw new NotFoundException(
          `Rol GUARDIAN no encontrado. Ejecutar seed.`,
        );
      }

      const existingPersonRole = await queryRunner.manager.findOne(PersonRole, {
        where: { personId: person.id, roleId: RoleId.GUARDIAN },
      });

      if (!existingPersonRole) {
        const personRole = queryRunner.manager.create(PersonRole, {
          personId: person.id,
          roleId: RoleId.GUARDIAN,
        });
        await queryRunner.manager.save(personRole);
      }

      // Create guardian record if not exists
      let guardian = await queryRunner.manager.findOne(Guardian, {
        where: { personId: person.id },
      });

      if (!guardian) {
        guardian = queryRunner.manager.create(Guardian, {
          personId: person.id,
        });
        guardian = await queryRunner.manager.save(guardian);
      }

      await queryRunner.commitTransaction();

      return {
        id: guardian.id,
        success: true,
        message: 'Apoderado registrado exitosamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          success: false,
          message: 'Error al registrar el apoderado',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(params: ListGuardianDto) {
    const { pagination, search } = params;
    const page = pagination?.page;
    const limit = pagination?.limit;

    const qb = this.guardianRepository
      .createQueryBuilder('g')
      .select(['g.id'])
      .leftJoin('g.person', 'p')
      .addSelect([
        'p.id',
        'p.documentTypeId',
        'p.documentNumber',
        'p.names',
        'p.paternalLastName',
        'p.maternalLastName',
        'p.email',
        'p.phone',
      ])
      .leftJoin('p.personRoles', 'pr')
      .addSelect(['pr.isActive'])
      .leftJoin('pr.role', 'r', 'r.id = :roleId', { roleId: RoleId.GUARDIAN })
      .addSelect(['r.id'])
      .orderBy('p.paternalLastName', 'ASC')
      .addOrderBy('p.names', 'ASC');

    if (search) {
      qb.where(
        'LOWER(p.names) LIKE :search OR LOWER(p.paternalLastName) LIKE :search OR LOWER(p.maternalLastName) LIKE :search OR p.documentNumber LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    let data: Guardian[];
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

    const mapped = data.map((g) => ({
      ...g,
      isActive:
        g.person.personRoles.find((pr) => pr.role?.id === RoleId.GUARDIAN)
          ?.isActive ?? true,
    }));

    return {
      data: mapped,
      total,
      pagination: page && limit ? { page, limit } : undefined,
    };
  }

  async findOne(id: string) {
    const guardian = await this.guardianRepository.findOne({
      where: { id },
      relations: { person: { personRoles: { role: true } } },
    });

    if (!guardian) throw new NotFoundException('Apoderado no encontrado');

    const guardianRole = guardian.person.personRoles.find(
      (pr) => pr.role?.id === RoleId.GUARDIAN,
    );

    return { ...guardian, isActive: guardianRole?.isActive ?? true };
  }

  async update(id: string, dto: UpdateGuardianDto) {
    const guardian = await this.guardianRepository.findOne({
      where: { id },
      relations: { person: true },
    });
    if (!guardian) throw new NotFoundException('Apoderado no encontrado');

    Object.assign(guardian.person, dto);
    await this.dataSource.getRepository(Person).save(guardian.person);

    return this.findOne(id);
  }

  async toggleActive(id: string) {
    const guardian = await this.guardianRepository.findOne({ where: { id } });
    if (!guardian) throw new NotFoundException('Apoderado no encontrado');

    const personRole = await this.personRoleRepository.findOne({
      where: { personId: guardian.personId, roleId: RoleId.GUARDIAN },
    });
    if (!personRole)
      throw new NotFoundException('Rol de apoderado no encontrado');

    personRole.isActive = !personRole.isActive;
    await this.personRoleRepository.save(personRole);

    return {
      id: guardian.id,
      isActive: personRole.isActive,
      message: personRole.isActive
        ? 'Apoderado activado'
        : 'Apoderado desactivado',
    };
  }

  async remove(id: string) {
    const guardian = await this.guardianRepository.findOne({ where: { id } });
    if (!guardian) throw new NotFoundException('Apoderado no encontrado');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(PersonRole, {
        personId: guardian.personId,
        roleId: RoleId.GUARDIAN,
      });
      await queryRunner.manager.remove(Guardian, guardian);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          success: false,
          message: 'Error al eliminar el apoderado',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
