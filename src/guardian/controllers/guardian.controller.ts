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
import { ClientType } from 'src/auth/enums/client-type.enum';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateGuardianDto } from '../dto/create-guardian.dto';
import { ListGuardianDto } from '../dto/list-guardian.dto';
import { UpdateGuardianDto } from '../dto/update-guardian.dto';
import { GuardianService } from '../services/guardian.service';

@Auth([RoleId.ADMIN], [ClientType.WEB])
@Controller('guardians')
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  @Auth([RoleId.GUARDIAN], [ClientType.APP])
  @Get('my-students')
  getMyStudents(@Req() req: Request) {
    const personId = (req.user as any).person.id as string;
    return this.guardianService.findMyStudents(personId);
  }

  @Auth([RoleId.GUARDIAN], [ClientType.APP])
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGuardianDto,
  ) {
    return this.guardianService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.guardianService.toggleActive(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.guardianService.remove(id);
  }
}
