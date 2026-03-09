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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStudentDto } from '../dto/create-student.dto';
import { QueryStudentDto } from '../dto/query-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { ImportService } from '../services/import.service';
import { StudentService } from '../services/student.service';

@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly importService: ImportService,
  ) {}

  @Post('create')
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
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

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.remove(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    return this.importService.processExcel(file.buffer);
  }
}
