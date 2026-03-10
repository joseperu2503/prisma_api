import { Injectable } from '@nestjs/common';
import { AdminService } from 'src/admin/services/admin.service';

@Injectable()
export class AdminSeed {
  constructor(private readonly adminService: AdminService) {}

  admins = [
    {
      person: {
        names: 'Juan Carlos',
        paternalLastName: 'García',
        maternalLastName: 'López',
        documentTypeId: 'dni',
        documentNumber: '10234567',
        email: 'jgarcia@colegio.edu.pe',
      },
    },
    {
      person: {
        names: 'María Elena',
        paternalLastName: 'Rojas',
        maternalLastName: 'Vega',
        documentTypeId: 'dni',
        documentNumber: '10345678',
        email: 'mrojas@colegio.edu.pe',
      },
    },
    {
      person: {
        names: 'Roberto',
        paternalLastName: 'Castillo',
        maternalLastName: 'Herrera',
        documentTypeId: 'dni',
        documentNumber: '10456789',
        email: 'rcastillo@colegio.edu.pe',
      },
    },
  ];

  async run() {
    for (const adminData of this.admins) {
      await this.adminService.create(adminData);
    }
  }
}
