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
    { code: 'ADMIN', name: 'Administrador', isEmployee: false },
    { code: 'STUDENT', name: 'Estudiante', isEmployee: false },
    { code: 'TEACHER', name: 'Docente', isEmployee: true },
    { code: 'GUARDIAN', name: 'Apoderado', isEmployee: false },
    { code: 'SECRETARY', name: 'Secretaria', isEmployee: true },
  ];

  async run() {
    for (const roleData of this.roles) {
      await this.create(roleData);
    }
  }

  private async create(params: {
    code: string;
    name: string;
    isEmployee: boolean;
  }) {
    const { code, name, isEmployee } = params;

    let role = await this.roleRepository.findOne({
      where: { code },
    });

    if (!role) {
      role = this.roleRepository.create({
        code,
        name,
        isEmployee,
      });
      role = await this.roleRepository.save(role);
    } else {
      role.name = name;
      role.isEmployee = isEmployee;
      role = await this.roleRepository.save(role);
    }

    // Si es ADMIN, le asignamos todos los permisos por defecto
    if (code === 'ADMIN') {
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
