import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { EnrollmentService } from 'src/enrollment/services/enrollment.service';
import { Person } from 'src/person/entities/person.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateStudentDto } from '../dto/create-student.dto';
import { Student } from '../entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,

    private readonly enrollmentService: EnrollmentService,
  ) {}

  async create(registerStudentDto: CreateStudentDto) {
    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1️⃣ Crear persona
        const person = manager.create(Person, {
          names: registerStudentDto.names,
          paternal_last_name: registerStudentDto.paternalLastName,
          maternal_last_name: registerStudentDto.maternalLastName,
          documentTypeId: registerStudentDto.documentTypeId,
          documentNumber: registerStudentDto.documentNumber,
          birthDate: registerStudentDto.birthDate,
          genderId: registerStudentDto.genderId,
          phone: registerStudentDto.phone,
          address: registerStudentDto.address,
          email: registerStudentDto.email,
        });

        const savedPerson = await manager.save(person);

        // 2️⃣ Crear usuario
        const user = manager.create(User, {
          password: registerStudentDto.password,
          personId: savedPerson.id,
        });

        const savedUser = await manager.save(user);

        // 3️⃣ Crear estudiante
        const student = manager.create(Student, {
          personId: savedPerson.id,
          userId: savedUser.id,
        });

        const savedStudent = await manager.save(student);

        return {
          id: savedStudent.id,
          success: true,
          message: 'Student created successfully',
        };
      } catch (error) {
        // Si algo falla, automáticamente hace rollback
        throw new HttpException(
          {
            success: false,
            message: 'An error occurred while creating the student',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async findAll() {
    return this.studentRepository.find();
  }

  async findById(id: string) {
    return this.studentRepository.findOne({
      where: { id },
    });
  }
}
