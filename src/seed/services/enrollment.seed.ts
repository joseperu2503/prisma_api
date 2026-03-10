import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Person } from 'src/person/entities/person.entity';
import { Student } from 'src/student/entities/student.entity';
import { Repository } from 'typeorm';

// document number → grade name for 2026 enrollment
const ENROLLMENTS_2026: Record<string, string> = {
  '72345678': 'Primer Grado A',
  '74567890': 'Primer Grado B',
  '76789012': 'Segundo Grado A',
  '78901234': 'Segundo Grado B',
  '73456789': 'Tercer Grado',
  '75678901': 'Cuarto Grado',
  '77890123': 'Quinto Grado',
  '79012345': 'Sexto Grado',
  '72890123': 'Primero Secundaria',
  '74012345': 'Segundo Secundaria',
  '76234567': 'Tercero Secundaria',
  '78456789': 'Primero Secundaria',
};

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
  ) {}

  async run() {
    const academicYear = await this.academicYearRepository.findOneBy({ name: '2026' });
    if (!academicYear) return;

    for (const [documentNumber, gradeName] of Object.entries(ENROLLMENTS_2026)) {
      const person = await this.personRepository.findOneBy({ documentNumber });
      if (!person) continue;

      const student = await this.studentRepository.findOneBy({ personId: person.id });
      if (!student) continue;

      const grade = await this.gradeRepository.findOneBy({ name: gradeName });
      if (!grade) continue;

      const exists = await this.enrollmentRepository.findOneBy({
        studentId: student.id,
        academicYearId: academicYear.id,
      });

      if (!exists) {
        const enrollment = this.enrollmentRepository.create({
          studentId: student.id,
          gradeId: grade.id,
          academicYearId: academicYear.id,
          isActive: true,
        });
        await this.enrollmentRepository.save(enrollment);
      }
    }
  }
}
