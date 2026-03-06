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
import { AssignPeriodToYearDto } from '../dto/assign-period-to-year.dto';
import { CreateAcademicPeriodDto } from '../dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from '../dto/update-academic-period.dto';
import { AcademicPeriodService } from '../services/academic-period.service';

@Controller('academic-period')
export class AcademicPeriodController {
  constructor(private readonly academicPeriodService: AcademicPeriodService) {}

  @Post()
  create(@Body() createAcademicPeriodDto: CreateAcademicPeriodDto) {
    return this.academicPeriodService.create(createAcademicPeriodDto);
  }

  @Get()
  findAll() {
    return this.academicPeriodService.findAll();
  }

  @Post('assign')
  assignToYear(@Body() assignDto: AssignPeriodToYearDto) {
    return this.academicPeriodService.assignToYear(assignDto);
  }

  @Get('year/:yearId')
  findAssignmentsByYear(@Param('yearId', ParseUUIDPipe) yearId: string) {
    return this.academicPeriodService.findAssignmentsByYear(yearId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicPeriodService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAcademicPeriodDto: UpdateAcademicPeriodDto,
  ) {
    return this.academicPeriodService.update(id, updateAcademicPeriodDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicPeriodService.remove(id);
  }
}
