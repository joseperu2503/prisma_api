import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { ClassAcademicYearDto } from '../dto/class-academic-year.dto';
import { CreateDefaultProductDto } from '../dto/create-default-product.dto';
import { ClassAcademicYearService } from '../services/class-academic-year.service';

@Auth([RoleId.ADMIN])
@Controller('class-academic-year')
export class ClassAcademicYearController {
  constructor(
    private readonly classAcademicYearSvc: ClassAcademicYearService,
  ) {}

  // ── Default Products ──────────────────────────────────────────────────────

  @Post('default-products/list')
  findDefaultProducts(@Body() dto: ClassAcademicYearDto) {
    return this.classAcademicYearSvc.findProductsByClass(
      dto.classId,
      dto.academicYearId,
    );
  }

  @Post('default-products/create')
  createDefaultProduct(@Body() dto: CreateDefaultProductDto) {
    return this.classAcademicYearSvc.createDefaultProduct(dto);
  }

  @Delete('default-products/:id/remove')
  removeDefaultProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.classAcademicYearSvc.removeDefaultProduct(id);
  }
}
