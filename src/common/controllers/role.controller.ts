import { Controller, Get, Query } from '@nestjs/common';
import { RoleService } from '../services/role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll(@Query('isEmployee') isEmployee?: string) {
    const filter =
      isEmployee === 'true' ? true : isEmployee === 'false' ? false : undefined;
    return this.roleService.findAll(filter);
  }
}
