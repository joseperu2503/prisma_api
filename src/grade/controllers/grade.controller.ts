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
import { AssignGradeToYearDto } from '../dto/assign-grade-to-year.dto';
import { CreateGradeDto } from '../dto/create-grade.dto';
import { ListGradesDto } from '../dto/list-grades.dto';
import { UpdateGradeDto } from '../dto/update-grade.dto';
import { GradeService } from '../services/grade.service';

@Auth([RoleId.ADMIN])
@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.create(createGradeDto);
  }

  @Post('list')
  findAll(@Body() body: ListGradesDto) {
    return this.gradeService.findAll(body);
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
