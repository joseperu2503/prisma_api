import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateStudentDto } from '../dto/create-student.dto';
import { StudentService } from '../services/student.service';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('create')
  async create(@Body() registerStudentDto: CreateStudentDto) {
    return this.studentService.create(registerStudentDto);
  }

  @Get()
  async findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.studentService.findById(id);
  }
}
