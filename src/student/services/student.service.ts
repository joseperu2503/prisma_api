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
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateStudentDto } from '../dto/create-student.dto';
import { Student } from '../entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createStudentDto: CreateStudentDto, runner?: QueryRunner) {
    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      const { personId, newPerson, password } = createStudentDto;

      let person: Person | null = null;

      // 1️⃣ Resolver Persona
      if (personId) {
        person = await queryRunner.manager.findOne(Person, {
          where: { id: personId },
        });
        if (!person) {
          throw new NotFoundException(`Person with ID ${personId} not found`);
        }
      } else if (newPerson) {
        const existingPerson = await queryRunner.manager.findOne(Person, {
          where: {
            documentTypeId: newPerson.documentTypeId,
            documentNumber: newPerson.documentNumber,
          },
        });

        if (existingPerson) {
          person = existingPerson;
        } else {
          person = queryRunner.manager.create(Person, { ...newPerson });
          person = await queryRunner.manager.save(person);
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

      // 2️⃣ Resolver/Crear Usuario
      let user = await queryRunner.manager.findOne(User, {
        where: { personId: person.id },
      });

      if (!user) {
        user = queryRunner.manager.create(User, {
          personId: person.id,
          password: bcrypt.hashSync(password, 10),
        });
        user = await queryRunner.manager.save(user);
      }

      // 3️⃣ Asignar Rol de Estudiante a la PERSONA
      const studentRole = await queryRunner.manager.findOne(Role, {
        where: { code: 'STUDENT' },
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
      const existingStudent = await queryRunner.manager.findOne(Student, {
        where: { personId: person.id },
      });

      if (existingStudent) {
        throw new ConflictException(
          `Esta persona ya está registrada como estudiante`,
        );
      }

      const student = queryRunner.manager.create(Student, {
        personId: person.id,
        userId: user.id,
      });

      const savedStudent = await queryRunner.manager.save(student);

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

  async findAll() {
    return this.studentRepository.find({
      relations: { person: true },
    });
  }

  async findById(id: string) {
    return this.studentRepository.findOne({
      where: { id },
      relations: { person: true },
    });
  }
}
