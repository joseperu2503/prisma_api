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
import { CreateStudentDto } from '../dto/create-student.dto';
import { ListStudentDto } from '../dto/list-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentService } from '../services/student.service';

@Auth([RoleId.ADMIN, RoleId.STUDENT])
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('create')
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Post('list')
  findAll(@Body() body: ListStudentDto) {
    return this.studentService.findAll(body);
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
