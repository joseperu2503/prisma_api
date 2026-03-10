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
import { RoleCode } from 'src/auth/enums/role-code.enum';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { PersonService } from 'src/person/services/person.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateTeacherDto } from '../dto/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/update-teacher.dto';
import { Teacher } from '../entities/teacher.entity';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    @InjectRepository(PersonRole)
    private readonly personRoleRepository: Repository<PersonRole>,

    private readonly dataSource: DataSource,

    private readonly personService: PersonService,
  ) {}

  async updateOrCreate(
    createTeacherDto: CreateTeacherDto,
    runner?: QueryRunner,
  ) {
    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      const { person: personDto, password } = createTeacherDto;

      // 1️⃣ Resolver Persona
      const person = await this.personService.updateOrCreatePerson(
        personDto,
        queryRunner,
      );

      // 2️⃣ Resolver/Crear Usuario
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

      // 3️⃣ Asignar Rol de Docente a la PERSONA
      const teacherRole = await queryRunner.manager.findOne(Role, {
        where: { code: RoleCode.TEACHER },
      });

      if (!teacherRole) {
        throw new NotFoundException(
          `Role with code 'TEACHER' not found. Run seed first.`,
        );
      }

      const existingPersonRole = await queryRunner.manager.findOne(PersonRole, {
        where: { personId: person.id, roleId: teacherRole.id },
      });

      if (!existingPersonRole) {
        const personRole = queryRunner.manager.create(PersonRole, {
          personId: person.id,
          roleId: teacherRole.id,
        });
        await queryRunner.manager.save(personRole);
      }

      // 4️⃣ Validar unicidad y crear Teacher
      let savedTeacher: Teacher | null = null;

      const existingTeacher = await queryRunner.manager.findOne(Teacher, {
        where: { personId: person.id },
      });

      if (existingTeacher) {
        savedTeacher = existingTeacher;
      } else {
        const teacher = queryRunner.manager.create(Teacher, {
          personId: person.id,
          userId: user.id,
        });

        savedTeacher = await queryRunner.manager.save(teacher);
      }

      if (!isExternalTransaction) {
        await queryRunner.commitTransaction();
      }

      return {
        id: savedTeacher.id,
        success: true,
        message: 'Teacher created successfully',
      };
    } catch (error) {
      if (!isExternalTransaction) {
        await queryRunner.rollbackTransaction();
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the teacher',
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

  async findAllPaginated(page: number, limit: number, search?: string) {
    const qb = this.teacherRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.person', 'p')
      .leftJoinAndSelect('p.personRoles', 'pr')
      .leftJoinAndSelect('pr.role', 'r', 'r.code = :code', { code: RoleCode.TEACHER })
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

    const mapped = data.map((t) => ({
      ...t,
      isActive: t.person.personRoles[0]?.isActive ?? true,
    }));

    return { data: mapped, total, page, limit };
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: { person: { personRoles: { role: true } } },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    const teacherPersonRole = teacher.person.personRoles.find(
      (pr) => pr.role?.code === RoleCode.TEACHER,
    );

    return { ...teacher, isActive: teacherPersonRole?.isActive ?? true };
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: { person: true },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    Object.assign(teacher.person, dto);
    await this.personRepository.save(teacher.person);
    return this.teacherRepository.findOne({
      where: { id },
      relations: { person: true },
    });
  }

  async toggleActive(id: string) {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    const teacherRole = await this.dataSource
      .getRepository(Role)
      .findOne({ where: { code: RoleCode.TEACHER } });

    if (!teacherRole) {
      throw new NotFoundException(`Role TEACHER not found`);
    }

    const personRole = await this.personRoleRepository.findOne({
      where: { personId: teacher.personId, roleId: teacherRole.id },
    });

    if (!personRole) {
      throw new NotFoundException(`Rol de docente no encontrado`);
    }

    personRole.isActive = !personRole.isActive;
    await this.personRoleRepository.save(personRole);

    return {
      id: teacher.id,
      isActive: personRole.isActive,
      message: personRole.isActive ? 'Docente activado' : 'Docente desactivado',
    };
  }

  async remove(id: string) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const teacherRole = await queryRunner.manager.findOne(Role, {
        where: { code: RoleCode.TEACHER },
      });

      if (teacherRole) {
        await queryRunner.manager.delete(PersonRole, {
          personId: teacher.personId,
          roleId: teacherRole.id,
        });
      }

      await queryRunner.manager.remove(Teacher, teacher);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          success: false,
          message: 'Error al eliminar el docente',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
