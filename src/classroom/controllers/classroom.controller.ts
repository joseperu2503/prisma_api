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
import { AssignClassroomToYearDto } from '../dto/assign-classroom-to-year.dto';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { QueryClassroomDto } from '../dto/query-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { ClassroomService } from '../services/classroom.service';

@Controller('classroom')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  create(@Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomService.create(createClassroomDto);
  }

  @Get()
  findAll(@Query() query: QueryClassroomDto) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    return this.classroomService.findAllPaginated(page, limit, query.search);
  }

  @Post('assign')
  assignToYear(@Body() assignDto: AssignClassroomToYearDto) {
    return this.classroomService.assignToYear(assignDto);
  }

  @Get('year/:yearId')
  findAssignmentsByYear(@Param('yearId', ParseUUIDPipe) yearId: string) {
    return this.classroomService.findAssignmentsByYear(yearId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.classroomService.findOne(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.classroomService.toggleActive(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ) {
    return this.classroomService.update(id, updateClassroomDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.classroomService.remove(id);
  }
}
