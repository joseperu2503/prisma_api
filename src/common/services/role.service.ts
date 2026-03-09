import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/auth/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  findAll(isEmployee?: boolean) {
    if (isEmployee !== undefined) {
      return this.roleRepository.find({ where: { isEmployee } });
    }
    return this.roleRepository.find();
  }
}
