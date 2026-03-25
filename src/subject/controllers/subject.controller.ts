import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { ListSubjectDto } from '../dto/list-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { SubjectService } from '../services/subject.service';

@Auth([RoleId.ADMIN])
@Controller('subjects')
export class SubjectController {
  constructor(private readonly service: SubjectService) {}

  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.service.create(dto);
  }

  @Post('list')
  findAll(@Body() body: ListSubjectDto) {
    return this.service.findAll(body);
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
