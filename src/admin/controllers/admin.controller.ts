import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { QueryAdminDto } from '../dto/query-admin.dto';
import { AdminService } from '../services/admin.service';

@Auth(['ADMIN', 'STUDENT'], ['web'])
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryAdminDto) {
    const page = parseInt(query.page ?? '1', 10);
    const limit = parseInt(query.limit ?? '10', 10);
    return this.adminService.findAllPaginated(page, limit, query.search);
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
