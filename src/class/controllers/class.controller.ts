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
import { CreateClassDto } from '../dto/create-class.dto';
import { QueryClassDto } from '../dto/query-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { ClassService } from '../services/class.service';

@Auth([RoleId.ADMIN], [ClientType.WEB])
@Controller('classes')
export class ClassController {
  constructor(private readonly service: ClassService) {}

  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryClassDto) {
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
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateClassDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
