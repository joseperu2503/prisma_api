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
import { CreateAcademicYearDto } from '../dto/create-academic-year.dto';
import { QueryAcademicYearDto } from '../dto/query-academic-year.dto';
import { UpdateAcademicYearDto } from '../dto/update-academic-year.dto';
import { AcademicYearService } from '../services/academic-year.service';

@Auth([RoleCode.ADMIN], [ClientType.WEB])
@Controller('academic-year')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Post()
  create(@Body() createAcademicYearDto: CreateAcademicYearDto) {
    return this.academicYearService.create(createAcademicYearDto);
  }

  @Get()
  findAll(@Query() query: QueryAcademicYearDto) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    return this.academicYearService.findAllPaginated(page, limit, query.search);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicYearService.findOne(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicYearService.toggleActive(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAcademicYearDto: UpdateAcademicYearDto,
  ) {
    return this.academicYearService.update(id, updateAcademicYearDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicYearService.remove(id);
  }
}
