import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/auth/entities/permission.entity';
import { RolePermission } from 'src/auth/entities/role-permission.entity';
import { Role } from 'src/auth/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleSeed {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  roles = [
    { id: 'ADMIN', name: 'Administrador' },
    { id: 'STUDENT', name: 'Estudiante' },
    { id: 'TEACHER', name: 'Docente' },
    { id: 'GUARDIAN', name: 'Apoderado' },
    { id: 'EMPLOYEE', name: 'Colaborador' },
  ];

  async run() {
    for (const role of this.roles) {
      await this.create(role);
    }
  }

  private async create(params: { id: string; name: string }) {
    const { id, name } = params;

    let role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      role = this.roleRepository.create(params);
      role = await this.roleRepository.save(role);
    } else {
      role.name = name;
      role = await this.roleRepository.save(role);
    }

    // Si es ADMIN, le asignamos todos los permisos por defecto
    if (id === 'ADMIN') {
      const allPermissions = await this.permissionRepository.find();
      for (const permission of allPermissions) {
        const exist = await this.rolePermissionRepository.findOne({
          where: { roleId: role.id, permissionId: permission.id },
        });

        if (!exist) {
          const rolePermission = this.rolePermissionRepository.create({
            roleId: role.id,
            permissionId: permission.id,
          });
          await this.rolePermissionRepository.save(rolePermission);
        }
      }
    }

    return role;
  }
}
