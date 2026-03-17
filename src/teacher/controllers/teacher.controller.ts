import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ClientType } from 'src/auth/enums/client-type.enum';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateTeacherDto } from '../dto/create-teacher.dto';
import { ListTeacherDto } from '../dto/list-teacher.dto';
import { UpdateTeacherDto } from '../dto/update-teacher.dto';
import { TeacherService } from '../services/teacher.service';

@Auth([RoleId.ADMIN], [ClientType.WEB])
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post('create')
  async create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.updateOrCreate(createTeacherDto);
  }

  @Post('list')
  findAll(@Body() body: ListTeacherDto) {
    return this.teacherService.findAll(body);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.toggleActive(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.remove(id);
  }
}
