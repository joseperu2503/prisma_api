import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ClientType } from 'src/auth/enums/client-type.enum';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { GuardianService } from 'src/guardian/services/guardian.service';
import { CreateStudentDto } from '../dto/create-student.dto';
import { ListStudentDto } from '../dto/list-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentService } from '../services/student.service';

@Auth([RoleId.ADMIN, RoleId.STUDENT], [ClientType.WEB])
@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly guardianService: GuardianService,
  ) {}

  @Post('create')
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.updateOrCreate(createStudentDto);
  }

  @Post('list')
  findAll(@Body() body: ListStudentDto) {
    return this.studentService.findAll(body);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.findOne(id);
  }

  @Get(':id/guardians')
  async findGuardians(@Param('id', ParseUUIDPipe) id: string) {
    return this.guardianService.findByStudent(id);
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

  @Delete(':id/guardians/:guardianId')
  @HttpCode(204)
  async removeGuardianLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('guardianId', ParseUUIDPipe) guardianId: string,
  ) {
    return this.guardianService.removeStudentLink(id, guardianId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.remove(id);
  }
}
