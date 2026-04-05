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
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { BulkChargeDto } from '../dto/bulk-charge.dto';
import { ChangeClassEnrollmentDto } from '../dto/change-class-enrollment.dto';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { ListEnrollmentDto } from '../dto/list-enrollment.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';
import { EnrollmentFormOptionsService } from '../services/enrollment-form-options.service';
import { EnrollmentService } from '../services/enrollment.service';
import { ImportService } from '../services/import.service';

@Auth([RoleId.ADMIN])
@Controller('enrollments')
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly enrollmentFormOptionsService: EnrollmentFormOptionsService,
    private readonly importService: ImportService,
  ) {}

  @Post()
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentService.create(dto);
  }

  @Post('list')
  findAll(@Body() body: ListEnrollmentDto) {
    return this.enrollmentService.findAll(body);
  }

  @Get('form-options/products')
  getFormProducts(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('academicYearId', ParseUUIDPipe) academicYearId: string,
  ) {
    return this.enrollmentFormOptionsService.getProducts(classId, academicYearId);
  }

  @Get('form-options/plans')
  getFormPlans(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('academicYearId', ParseUUIDPipe) academicYearId: string,
  ) {
    return this.enrollmentFormOptionsService.getPlans(classId, academicYearId);
  }

  @Get('by-class')
  findByClass(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('academicYearId', ParseUUIDPipe) academicYearId: string,
  ) {
    return this.enrollmentService.findByClass(classId, academicYearId);
  }

  @Post('bulk-charge')
  bulkCharge(@Body() dto: BulkChargeDto) {
    return this.enrollmentService.bulkCharge(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentService.toggleActive(id);
  }

  @Patch(':id/change-class')
  changeClass(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeClassEnrollmentDto,
  ) {
    return this.enrollmentService.changeClass(id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentService.remove(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    return this.importService.processExcel(file.buffer);
  }
}
