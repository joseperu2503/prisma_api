import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/auth/entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionSeed {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  permissions = [
    // {
    //   id: 'CREATE_USER',
    //   name: 'Crear Usuario',
    //   description: 'Permite crear nuevos usuarios',
    // },
    // {
    //   id: 'UPDATE_USER',
    //   name: 'Actualizar Usuario',
    //   description: 'Permite actualizar usuarios existentes',
    // },
    // {
    //   id: 'DELETE_USER',
    //   name: 'Eliminar Usuario',
    //   description: 'Permite eliminar usuarios',
    // },
    // {
    //   id: 'VIEW_USER',
    //   name: 'Ver Usuarios',
    //   description: 'Permite ver la lista de usuarios',
    // },
    // {
    //   id: 'GENERATE_QR',
    //   name: 'Generar QR',
    //   description: 'Permite generar credenciales QR',
    // },
  ];

  async run() {
    for (const permission of this.permissions) {
      await this.create(permission);
    }
  }

  private async create(params: {
    id: string;
    name: string;
    description: string;
  }) {
    const { id, name, description } = params;

    const isExist = await this.permissionRepository.findOne({
      where: { id },
    });

    if (isExist) {
      isExist.name = name;
      isExist.description = description;
      return this.permissionRepository.save(isExist);
    } else {
      const newPermission = this.permissionRepository.create(params);
      return this.permissionRepository.save(newPermission);
    }
  }
}
