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
import { RoleId } from 'src/auth/enums/role-id.enum';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { Person } from 'src/person/entities/person.entity';
import { PersonService } from 'src/person/services/person.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { Student } from '../entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    @InjectRepository(PersonRole)
    private readonly personRoleRepository: Repository<PersonRole>,

    private readonly dataSource: DataSource,

    private readonly personService: PersonService,
  ) {}

  async updateOrCreate(
    createStudentDto: CreateStudentDto,
    runner?: QueryRunner,
  ) {
    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      const { person: personDto, password } = createStudentDto;

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

      // 3️⃣ Asignar Rol de Estudiante a la PERSONA
      const studentRole = await queryRunner.manager.findOne(Role, {
        where: { id: RoleId.STUDENT },
      });

      if (!studentRole) {
        throw new NotFoundException(
          `Role with code 'STUDENT' not found. Run seed first.`,
        );
      }

      const existingPersonRole = await queryRunner.manager.findOne(PersonRole, {
        where: { personId: person.id, roleId: studentRole.id },
      });

      if (!existingPersonRole) {
        const personRole = queryRunner.manager.create(PersonRole, {
          personId: person.id,
          roleId: studentRole.id,
        });
        await queryRunner.manager.save(personRole);
      }

      // 4️⃣ Validar unicidad y crear Student
      let savedStudent: Student | null = null;

      const existingStudent = await queryRunner.manager.findOne(Student, {
        where: { personId: person.id },
      });

      if (existingStudent) {
        savedStudent = existingStudent;
      } else {
        const student = queryRunner.manager.create(Student, {
          personId: person.id,
          userId: user.id,
        });

        savedStudent = await queryRunner.manager.save(student);
      }

      if (!isExternalTransaction) {
        await queryRunner.commitTransaction();
      }

      return {
        id: savedStudent.id,
        success: true,
        message: 'Student created successfully',
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
          message: 'An error occurred while creating the student',
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
    const qb = this.studentRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.person', 'p')
      .leftJoinAndSelect('p.personRoles', 'pr')
      .leftJoinAndSelect('pr.role', 'r', 'r.id = :id', {
        id: RoleId.STUDENT,
      })
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

    const mapped = data.map((s) => ({
      ...s,
      isActive: s.person.personRoles[0]?.isActive ?? true,
    }));

    return { data: mapped, total, page, limit };
  }

  async findOne(id: string) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: { person: { personRoles: { role: true } } },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const studentPersonRole = student.person.personRoles.find(
      (pr) => pr.role?.id === RoleId.STUDENT,
    );

    return { ...student, isActive: studentPersonRole?.isActive ?? true };
  }

  async findById(id: string) {
    return this.studentRepository.findOne({
      where: { id },
      relations: { person: true },
    });
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: { person: true },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    Object.assign(student.person, dto);
    await this.personRepository.save(student.person);
    return this.studentRepository.findOne({
      where: { id },
      relations: { person: true },
    });
  }

  async toggleActive(id: string) {
    const student = await this.studentRepository.findOne({
      where: { id },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const studentRole = await this.dataSource
      .getRepository(Role)
      .findOne({ where: { id: RoleId.STUDENT } });

    if (!studentRole) {
      throw new NotFoundException(`Role STUDENT not found`);
    }

    const personRole = await this.personRoleRepository.findOne({
      where: { personId: student.personId, roleId: studentRole.id },
    });

    if (!personRole) {
      throw new NotFoundException(`Rol de estudiante no encontrado`);
    }

    personRole.isActive = !personRole.isActive;
    await this.personRoleRepository.save(personRole);

    return {
      id: student.id,
      isActive: personRole.isActive,
      message: personRole.isActive
        ? 'Estudiante activado'
        : 'Estudiante desactivado',
    };
  }

  async remove(id: string) {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const enrollmentCount = await this.dataSource
      .getRepository(Enrollment)
      .countBy({ studentId: student.id });

    if (enrollmentCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el estudiante porque tiene matrículas asociadas',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const studentRole = await queryRunner.manager.findOne(Role, {
        where: { id: RoleId.STUDENT },
      });

      if (studentRole) {
        await queryRunner.manager.delete(PersonRole, {
          personId: student.personId,
          roleId: studentRole.id,
        });
      }

      await queryRunner.manager.remove(Student, student);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          success: false,
          message: 'Error al eliminar el estudiante',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
