import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/auth/entities/permission.entity';
import { RolePermission } from 'src/auth/entities/role-permission.entity';
import { Role } from 'src/auth/entities/role.entity';
import { RoleId } from 'src/auth/enums/role-id.enum';
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
    { id: RoleId.ADMIN, name: 'Administrador' },
    { id: RoleId.STUDENT, name: 'Estudiante' },
    { id: RoleId.TEACHER, name: 'Docente' },
    { id: RoleId.GUARDIAN, name: 'Apoderado' },
    { id: RoleId.EMPLOYEE, name: 'Colaborador' },
  ];

  async run() {
    for (const roleData of this.roles) {
      await this.create(roleData);
    }
  }

  private async create(params: { id: RoleId; name: string }) {
    const { id, name } = params;

    let role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      role = this.roleRepository.create({
        id,
        name,
      });
      role = await this.roleRepository.save(role);
    } else {
      role.name = name;
      role = await this.roleRepository.save(role);
    }

    // Si es ADMIN, le asignamos todos los permisos por defecto
    if (id === RoleId.ADMIN) {
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
