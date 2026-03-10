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
import { RoleCode } from 'src/auth/enums/role-code.enum';
import { CreateAcademicProgramDto } from '../dto/create-academic-program.dto';
import { QueryAcademicProgramDto } from '../dto/query-academic-program.dto';
import { UpdateAcademicProgramDto } from '../dto/update-academic-program.dto';
import { AcademicProgramService } from '../services/academic-program.service';

@Auth([RoleCode.ADMIN], [ClientType.WEB])
@Controller('academic-programs')
export class AcademicProgramController {
  constructor(private readonly service: AcademicProgramService) {}

  @Post()
  create(@Body() dto: CreateAcademicProgramDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryAcademicProgramDto) {
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAcademicProgramDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
