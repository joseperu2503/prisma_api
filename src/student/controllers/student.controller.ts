import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStudentDto } from '../dto/create-student.dto';
import { ImportService } from '../services/import.service';
import { StudentService } from '../services/student.service';

@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,

    private readonly importService: ImportService,
  ) {}

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

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    return this.importService.processExcel(file.buffer);
  }
}
