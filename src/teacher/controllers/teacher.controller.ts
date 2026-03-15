import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ClientType } from 'src/auth/enums/client-type.enum';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateTeacherDto } from '../dto/create-teacher.dto';
import { QueryTeacherDto } from '../dto/query-teacher.dto';
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

  @Get()
  async findAll(@Query() query: QueryTeacherDto) {
    const page = parseInt(query.page ?? '1', 10);
    const limit = parseInt(query.limit ?? '10', 10);
    return this.teacherService.findAllPaginated(page, limit, query.search);
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
