import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/auth/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleSeed {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  roles = [
    { id: 'ADMIN', name: 'Administrador' },
    { id: 'STUDENT', name: 'Estudiante' },
    { id: 'TEACHER', name: 'Docente' },
    { id: 'GUARDIAN', name: 'Apoderado' },
    { id: 'EMPLOYEE', name: 'Empleado' },
  ];

  async run() {
    for (const role of this.roles) {
      await this.create(role);
    }
  }

  private async create(params: { id: string; name: string }) {
    const { id, name } = params;

    const isExist = await this.roleRepository.findOne({
      where: { id },
    });

    if (isExist) {
      isExist.name = name;
      return this.roleRepository.save(isExist);
    } else {
      const newRole = this.roleRepository.create(params);
      return this.roleRepository.save(newRole);
    }
  }
}
