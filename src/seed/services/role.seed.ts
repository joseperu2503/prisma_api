import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/auth/entities/permission.entity';
import { RolePermission } from 'src/auth/entities/role-permission.entity';
import { Role } from 'src/auth/entities/role.entity';
import { RoleCode } from 'src/auth/enums/role-code.enum';
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
    { code: RoleCode.ADMIN, name: 'Administrador', isEmployee: false },
    { code: RoleCode.STUDENT, name: 'Estudiante', isEmployee: false },
    { code: RoleCode.TEACHER, name: 'Docente', isEmployee: true },
    { code: RoleCode.GUARDIAN, name: 'Apoderado', isEmployee: false },
    { code: RoleCode.SECRETARY, name: 'Secretaria', isEmployee: true },
  ];

  async run() {
    for (const roleData of this.roles) {
      await this.create(roleData);
    }
  }

  private async create(params: {
    code: RoleCode;
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
