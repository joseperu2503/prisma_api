import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ClientType } from 'src/auth/enums/client-type.enum';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { ListAdminDto } from '../dto/list-admin.dto';
import { AdminService } from '../services/admin.service';

@Auth([RoleId.ADMIN, RoleId.STUDENT], [ClientType.WEB])
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  @Post('list')
  findAll(@Body() body: ListAdminDto) {
    return this.adminService.findAll(body);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.toggleActive(id);
  }
}
