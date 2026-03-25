import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateAttendanceScheduleDto } from '../dto/create-attendance-schedule.dto';
import { AttendanceScheduleService } from '../services/attendance-schedule.service';

@Auth([RoleId.ADMIN])
@Controller('attendance/schedules')
export class AttendanceScheduleController {
  constructor(private readonly service: AttendanceScheduleService) {}

  @Get()
  findByClassAndYear(
    @Query('classId') classId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.service.findByClassAndYear(classId, academicYearId);
  }

  @Post()
  create(@Body() dto: CreateAttendanceScheduleDto) {
    return this.service.create(dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deactivate(id);
  }

  @Get('seed/bulk-create')
  bulkCreateSchedules() {
    return this.service.bulkCreateSchedules();
  }
}
