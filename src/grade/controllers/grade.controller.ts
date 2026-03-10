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
import { AssignGradeToYearDto } from '../dto/assign-grade-to-year.dto';
import { CreateGradeDto } from '../dto/create-grade.dto';
import { QueryGradeDto } from '../dto/query-grade.dto';
import { UpdateGradeDto } from '../dto/update-grade.dto';
import { GradeService } from '../services/grade.service';

@Auth([RoleCode.ADMIN], [ClientType.WEB])
@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.create(createGradeDto);
  }

  @Get()
  findAll(@Query() query: QueryGradeDto) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    return this.gradeService.findAllPaginated(page, limit, query.search);
  }

  @Post('assign')
  assignToYear(@Body() assignDto: AssignGradeToYearDto) {
    return this.gradeService.assignToYear(assignDto);
  }

  @Get('year/:yearId')
  findAssignmentsByYear(@Param('yearId', ParseUUIDPipe) yearId: string) {
    return this.gradeService.findAssignmentsByYear(yearId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradeService.findOne(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradeService.toggleActive(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    return this.gradeService.update(id, updateGradeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradeService.remove(id);
  }
}
