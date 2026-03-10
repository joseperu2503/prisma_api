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
import { CreateStudentDto } from '../dto/create-student.dto';
import { QueryStudentDto } from '../dto/query-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentService } from '../services/student.service';

@Auth([RoleCode.ADMIN, RoleCode.STUDENT], [ClientType.WEB])
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('create')
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.updateOrCreate(createStudentDto);
  }

  @Get()
  async findAll(@Query() query: QueryStudentDto) {
    const page = parseInt(query.page ?? '1', 10);
    const limit = parseInt(query.limit ?? '10', 10);
    return this.studentService.findAllPaginated(page, limit, query.search);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.toggleActive(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.remove(id);
  }
}
