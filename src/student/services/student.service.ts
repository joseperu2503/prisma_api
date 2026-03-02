import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Person } from 'src/person/entities/person.entity';
import { Repository } from 'typeorm';
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
  ) {}

  async create(registerStudentDto: CreateStudentDto) {
    try {
      //crear nuevo persona
      const person = this.personRepository.create({
        names: registerStudentDto.names,
        paternal_last_name: registerStudentDto.paternal_last_name,
        maternal_last_name: registerStudentDto.maternal_last_name,
        documentTypeId: registerStudentDto.documentTypeId,
        documentNumber: registerStudentDto.documentNumber,
        birthDate: registerStudentDto.birthDate,
        genderId: registerStudentDto.genderId,
        phone: registerStudentDto.phone,
        address: registerStudentDto.address,
      });

      const savedPerson: Person = await this.personRepository.save(person);

      // Crear nuevo estudiante
      const student = this.studentRepository.create({
        personId: savedPerson.id,
      });

      const savedStudent = await this.studentRepository.save(student);

      //crear nuevo usuario
      const user = this.userRepository.create({
        email: registerStudentDto.email,
        password: registerStudentDto.password,
        personId: savedPerson.id,
      });

      const savedUser = await this.userRepository.save(user);

      return {
        success: true,
        message: 'Student created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the student',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
