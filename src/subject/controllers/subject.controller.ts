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
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { QuerySubjectDto } from '../dto/query-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { SubjectService } from '../services/subject.service';

@Auth([RoleId.ADMIN], [ClientType.WEB])
@Controller('subjects')
export class SubjectController {
  constructor(private readonly service: SubjectService) {}

  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QuerySubjectDto) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    if (query.page === undefined && query.limit === undefined) {
      return this.service.findAll();
    }
    return this.service.findAllPaginated(page, limit, query.search);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.toggleActive(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSubjectDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
