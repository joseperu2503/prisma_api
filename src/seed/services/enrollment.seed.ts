import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { Class } from 'src/class/entities/class.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { Repository } from 'typeorm';

// document number → grade name for 2026 enrollment
const ENROLLMENTS_2026: {
  documentNumber: string;
  gradeName: string;
  className: string;
}[] = [
  {
    documentNumber: '72345678',
    gradeName: 'Primer Grado A',
    className: 'Segundo Grado',
  },
  {
    documentNumber: '74567890',
    gradeName: 'Primer Grado B',
    className: 'Segundo Grado',
  },
  {
    documentNumber: '76789012',
    gradeName: 'Segundo Grado A',
    className: 'Segundo Grado',
  },
  {
    documentNumber: '78901234',
    gradeName: 'Segundo Grado B',
    className: 'Segundo Grado',
  },
  {
    documentNumber: '73456789',
    gradeName: 'Tercer Grado',
    className: 'Tercer Grado',
  },
  {
    documentNumber: '75678901',
    gradeName: 'Cuarto Grado',
    className: 'Tercer Grado',
  },
  {
    documentNumber: '77890123',
    gradeName: 'Quinto Grado',
    className: 'Cuarto Grado',
  },
  {
    documentNumber: '79012345',
    gradeName: 'Sexto Grado',
    className: 'Cuarto Grado',
  },
  {
    documentNumber: '72890123',
    gradeName: 'Primero Secundaria',
    className: 'Pre',
  },
  {
    documentNumber: '74012345',
    gradeName: 'Segundo Secundaria',
    className: 'Pre',
  },
  {
    documentNumber: '76234567',
    gradeName: 'Tercero Secundaria',
    className: 'Pre',
  },
  {
    documentNumber: '78456789',
    gradeName: 'Primero Secundaria',
    className: 'Pre',
  },
];

@Injectable()
export class EnrollmentSeed {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async run() {
    const academicYear = await this.academicYearRepository.findOneBy({
      name: '2026',
    });
    if (!academicYear) return;

    for (const { documentNumber, gradeName, className } of ENROLLMENTS_2026) {
      const person = await this.personRepository.findOneBy({ documentNumber });
      if (!person) continue;

      const student = await this.studentRepository.findOneBy({
        personId: person.id,
      });
      if (!student) continue;

      const grade = await this.gradeRepository.findOneBy({ name: gradeName });
      if (!grade) continue;

      const class_ = await this.classRepository.findOneBy({ name: className });
      if (!class_) continue;

      const exists = await this.enrollmentRepository.findOneBy({
        studentId: student.id,
        academicYearId: academicYear.id,
      });

      if (!exists) {
        const enrollment = this.enrollmentRepository.create({
          studentId: student.id,
          gradeId: grade.id,
          academicYearId: academicYear.id,
          classId: class_.id,
          isActive: true,
        });
        await this.enrollmentRepository.save(enrollment);
      }
    }
  }
}
