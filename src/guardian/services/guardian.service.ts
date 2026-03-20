import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { RoleService } from 'src/auth/services/role.service';
import { UserService } from 'src/auth/services/user.service';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { PersonService } from 'src/person/services/person.service';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { CreateGuardianDto } from '../dto/create-guardian.dto';
import { ListGuardianDto } from '../dto/list-guardian.dto';
import { UpdateGuardianDto } from '../dto/update-guardian.dto';
import { Guardian } from '../entities/guardian.entity';
import { StudentGuardian } from '../entities/student-guardian.entity';

@Injectable()
export class GuardianService {
  constructor(
    @InjectRepository(Guardian)
    private readonly guardianRepository: Repository<Guardian>,

    @InjectRepository(PersonRole)
    private readonly personRoleRepository: Repository<PersonRole>,

    private readonly dataSource: DataSource,
    private readonly personService: PersonService,

    private readonly userService: UserService,

    private readonly roleService: RoleService,
  ) {}

  async create(
    dto: CreateGuardianDto,
    runner?: QueryRunner,
    params: { throwIfExists?: boolean } = {},
  ) {
    const { throwIfExists = true } = params;

    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      // 1️⃣ Resolver Persona
      let person: Person = await this.personService.findOrCreate(
        dto.person,
        queryRunner,
      );

      // 2️⃣ Resolver/Crear Usuario
      let user = await this.userService.findOrCreate(
        person.id,
        person.documentNumber,
        queryRunner,
      );

      // 3️⃣ Asignar Rol de Estudiante a la PERSONA
      await this.roleService.assignRole(
        person.id,
        RoleId.GUARDIAN,
        queryRunner,
      );

      // Create guardian record if not exists
      let guardian = await queryRunner.manager.findOne(Guardian, {
        where: { personId: person.id },
      });

      if (guardian && throwIfExists) {
        throw new ConflictException(
          'La persona ya está registrada como apoderado',
        );
      }

      if (!guardian) {
        guardian = queryRunner.manager.create(Guardian, {
          personId: person.id,
        });

        guardian = await queryRunner.manager.save(guardian);
      }

      if (dto.studentIds?.length) {
        this.syncStudentGuardians(dto.studentIds, [guardian.id], queryRunner);
      }

      if (!isExternalTransaction) {
        await queryRunner.commitTransaction();
      }

      return guardian;
    } catch (error) {
      if (!isExternalTransaction) {
        await queryRunner.rollbackTransaction();
      }

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
      if (!isExternalTransaction) {
        await queryRunner.release();
      }
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

    const guardianIds = data.map((g) => g.id);

    const studentGuardians = guardianIds.length
      ? await this.dataSource
          .getRepository(StudentGuardian)
          .createQueryBuilder('sg')
          .leftJoinAndSelect('sg.student', 'st')
          .leftJoinAndSelect('st.person', 'sp')
          .where('sg.guardianId IN (:...ids)', { ids: guardianIds })
          .select([
            'sg.guardianId',
            'st.id',
            'sp.id',
            'sp.names',
            'sp.paternalLastName',
            'sp.maternalLastName',
            'sp.documentNumber',
            'sp.documentTypeId',
          ])
          .getRawMany()
      : [];

    const studentsByGuardian = new Map<
      string,
      {
        id: string;
        person: {
          names: string;
          paternalLastName: string;
          maternalLastName: string;
          documentNumber: string;
        };
      }[]
    >();
    for (const sg of studentGuardians) {
      const gId = sg.sg_guardian_id;
      if (!studentsByGuardian.has(gId)) studentsByGuardian.set(gId, []);
      studentsByGuardian.get(gId)!.push({
        id: sg.st_id,
        person: {
          names: sg.sp_names,
          paternalLastName: sg.sp_paternal_last_name,
          maternalLastName: sg.sp_maternal_last_name,
          documentNumber: sg.sp_document_number,
        },
      });
    }

    const mapped = data.map((g) => ({
      ...g,
      isActive:
        g.person.personRoles.find((pr) => pr.role?.id === RoleId.GUARDIAN)
          ?.isActive ?? true,
      students: studentsByGuardian.get(g.id) ?? [],
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

    const studentGuardians = await this.dataSource
      .getRepository(StudentGuardian)
      .find({
        where: { guardianId: id },
        relations: { student: { person: true } },
      });

    const students = studentGuardians.map((sg) => ({
      id: sg.student.id,
      person: {
        id: sg.student.person.id,
        names: sg.student.person.names,
        paternalLastName: sg.student.person.paternalLastName,
        maternalLastName: sg.student.person.maternalLastName,
        documentNumber: sg.student.person.documentNumber,
        documentTypeId: sg.student.person.documentTypeId,
      },
    }));

    return { ...guardian, isActive: guardianRole?.isActive ?? true, students };
  }

  async update(id: string, dto: UpdateGuardianDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const guardian = await queryRunner.manager.findOne(Guardian, {
        where: { id },
        relations: { person: true },
      });
      if (!guardian) throw new NotFoundException('Apoderado no encontrado');

      if (dto.person) {
        Object.assign(guardian.person, dto.person);
        await queryRunner.manager.save(guardian.person);
      }

      if (dto.studentIds !== undefined) {
        await this.syncStudentGuardians([id], dto.studentIds, queryRunner);
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          success: false,
          message: 'Error al actualizar el apoderado',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
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

  async findByStudent(studentId: string) {
    const studentGuardians = await this.dataSource
      .getRepository(StudentGuardian)
      .find({
        where: { studentId },
        relations: { guardian: { person: true } },
      });

    return studentGuardians.map((sg) => ({
      id: sg.guardian.id,
      person: {
        id: sg.guardian.person.id,
        names: sg.guardian.person.names,
        paternalLastName: sg.guardian.person.paternalLastName,
        maternalLastName: sg.guardian.person.maternalLastName,
        documentNumber: sg.guardian.person.documentNumber,
        documentTypeId: sg.guardian.person.documentTypeId,
        email: sg.guardian.person.email,
        phone: sg.guardian.person.phone,
        address: sg.guardian.person.address,
      },
    }));
  }

  async syncStudentGuardians(
    guardianIds: string[],
    studentIds: string[],
    runner?: QueryRunner,
  ) {
    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      // 1. Fetch existing links involving any of the given guardians or students
      const existing = await queryRunner.manager.find(StudentGuardian, {
        where: [
          ...(guardianIds.length ? [{ guardianId: In(guardianIds) }] : []),
          ...(studentIds.length ? [{ studentId: In(studentIds) }] : []),
        ],
      });

      // 2. Remove links that don't belong to the desired set
      const toRemove = existing.filter(
        (sg) =>
          !guardianIds.includes(sg.guardianId) ||
          !studentIds.includes(sg.studentId),
      );

      if (toRemove.length) {
        await queryRunner.manager.remove(StudentGuardian, toRemove);
      }

      // 3. Create missing links for every guardianId x studentId combination
      for (const guardianId of guardianIds) {
        for (const studentId of studentIds) {
          const alreadyExists = existing.some(
            (sg) => sg.guardianId === guardianId && sg.studentId === studentId,
          );

          if (!alreadyExists) {
            await queryRunner.manager.save(
              queryRunner.manager.create(StudentGuardian, {
                guardianId,
                studentId,
              }),
            );
          }
        }
      }

      if (!isExternalTransaction) {
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      if (!isExternalTransaction) {
        await queryRunner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          success: false,
          message: 'Error al sincronizar apoderados',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (!isExternalTransaction) {
        await queryRunner.release();
      }
    }
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
