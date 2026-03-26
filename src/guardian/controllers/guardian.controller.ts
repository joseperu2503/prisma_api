import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateGuardianDto } from '../dto/create-guardian.dto';
import { ListGuardianDto } from '../dto/list-guardian.dto';
import { UpdateGuardianDto } from '../dto/update-guardian.dto';
import { GuardianService } from '../services/guardian.service';

@Auth([RoleId.ADMIN])
@Controller('guardians')
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  @Auth([RoleId.GUARDIAN])
  @Get('my-students')
  getMyStudents(@Req() req: Request) {
    const personId = (req.user as any).person.id as string;
    return this.guardianService.findMyStudents(personId);
  }

  @Auth([RoleId.GUARDIAN])
  @Get('my-students/:studentId/person')
  getStudentPerson(
    @Req() req: Request,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    const personId = (req.user as any).person.id as string;
    return this.guardianService.getStudentPersonData(personId, studentId);
  }

  @Auth([RoleId.GUARDIAN])
  @Get('my-students/recent-attendance')
  getRecentAttendance(@Req() req: Request) {
    const personId = (req.user as any).person.id as string;
    return this.guardianService.getRecentAttendance(personId);
  }

  @Post('create')
  async create(@Body() dto: CreateGuardianDto) {
    const guardian = await this.guardianService.create(dto);
    return {
      success: true,
      message: 'Apoderado registrado exitosamente',
    };
  }

  @Post('list')
  findAll(@Body() body: ListGuardianDto) {
    return this.guardianService.findAll(body);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.guardianService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGuardianDto,
  ) {
    await this.guardianService.update(id, dto);

    return {
      success: true,
      message: 'Apoderado actualizado correctamente',
    };
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    this.guardianService.toggleActive(id);
    return {
      success: true,
      message: 'Apoderado actualizado correctamente',
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.guardianService.remove(id);
    return {
      success: true,
      message: 'Apoderado eliminado correctamente',
    };
  }
}
