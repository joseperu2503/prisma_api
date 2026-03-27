import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
import { AdminService } from 'src/admin/services/admin.service';

@Injectable()
export class AdminSeed {
  constructor(private readonly adminService: AdminService) {}

  admins: CreateAdminDto[] = [
    {
      person: {
        new: {
          names: 'Jose',
          paternalLastName: 'Perez',
          maternalLastName: 'Gil',
          documentTypeId: 'dni',
          documentNumber: '74706220',
        },
      },
    },
    {
      person: {
        new: {
          names: 'Sharon',
          paternalLastName: 'Gil',
          maternalLastName: 'Mori',
          documentTypeId: 'dni',
          documentNumber: '40352379',
        },
      },
    },
  ];

  async run() {
    for (const adminData of this.admins) {
      await this.adminService.create(adminData);
    }
  }
}
