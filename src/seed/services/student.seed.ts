import { Injectable } from '@nestjs/common';
import { StudentService } from 'src/student/services/student.service';

@Injectable()
export class StudentSeed {
  constructor(private readonly studentService: StudentService) {}

  students = [
    {
      person: {
        names: 'Lucía',
        paternalLastName: 'Torres',
        maternalLastName: 'Mendoza',
        documentTypeId: 'dni',
        documentNumber: '72345678',
      },
    },
    {
      person: {
        names: 'Carlos',
        paternalLastName: 'Quispe',
        maternalLastName: 'Ramos',
        documentTypeId: 'dni',
        documentNumber: '74567890',
      },
    },
    {
      person: {
        names: 'Ana María',
        paternalLastName: 'Flores',
        maternalLastName: 'Cruz',
        documentTypeId: 'dni',
        documentNumber: '76789012',
      },
    },
    {
      person: {
        names: 'Diego',
        paternalLastName: 'Mamani',
        maternalLastName: 'Huanca',
        documentTypeId: 'dni',
        documentNumber: '78901234',
      },
    },
    {
      person: {
        names: 'Valentina',
        paternalLastName: 'Soto',
        maternalLastName: 'Paredes',
        documentTypeId: 'dni',
        documentNumber: '73456789',
      },
    },
    {
      person: {
        names: 'Gabriel',
        paternalLastName: 'Condori',
        maternalLastName: 'Lima',
        documentTypeId: 'dni',
        documentNumber: '75678901',
      },
    },
    {
      person: {
        names: 'Isabella',
        paternalLastName: 'Ríos',
        maternalLastName: 'Vargas',
        documentTypeId: 'dni',
        documentNumber: '77890123',
      },
    },
    {
      person: {
        names: 'Mateo',
        paternalLastName: 'Huanca',
        maternalLastName: 'Torres',
        documentTypeId: 'dni',
        documentNumber: '79012345',
      },
    },
    {
      person: {
        names: 'Sofía',
        paternalLastName: 'Ccallo',
        maternalLastName: 'Mamani',
        documentTypeId: 'dni',
        documentNumber: '72890123',
      },
    },
    {
      person: {
        names: 'Sebastián',
        paternalLastName: 'Palomino',
        maternalLastName: 'Cruz',
        documentTypeId: 'dni',
        documentNumber: '74012345',
      },
    },
    {
      person: {
        names: 'Camila',
        paternalLastName: 'Delgado',
        maternalLastName: 'Quispe',
        documentTypeId: 'dni',
        documentNumber: '76234567',
      },
    },
    {
      person: {
        names: 'Adrián',
        paternalLastName: 'Yupanqui',
        maternalLastName: 'Salas',
        documentTypeId: 'dni',
        documentNumber: '78456789',
      },
    },
  ];

  async run() {
    for (const studentData of this.students) {
      await this.studentService.updateOrCreate(studentData);
    }
  }
}
