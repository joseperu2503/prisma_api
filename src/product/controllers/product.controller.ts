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
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreatePresentationDto } from '../dto/create-presentation.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { ListProductDto } from '../dto/list-product.dto';
import { UpdatePresentationDto } from '../dto/update-presentation.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../services/product.service';
import { InjectRepository } from '@nestjs/typeorm';
import { IgvAffectationType } from '../entities/igv-affectation-type.entity';
import { UnitCode } from '../entities/unit-code.entity';
import { Repository } from 'typeorm';

@Auth([RoleId.ADMIN])
@Controller('products')
export class ProductController {
  constructor(
    private readonly service: ProductService,
    @InjectRepository(UnitCode) private readonly unitCodeRepo: Repository<UnitCode>,
    @InjectRepository(IgvAffectationType) private readonly igvRepo: Repository<IgvAffectationType>,
  ) {}

  @Get('unit-codes')
  findUnitCodes() {
    return this.unitCodeRepo.find({ order: { id: 'ASC' } });
  }

  @Get('igv-affectation-types')
  findIgvAffectationTypes() {
    return this.igvRepo.find({ order: { id: 'ASC' } });
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Post('list')
  findAll(@Body() dto: ListProductDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.toggleActive(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  // Presentations

  @Post(':id/presentations')
  addPresentation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePresentationDto,
  ) {
    return this.service.addPresentation(id, dto);
  }

  @Patch(':id/presentations/:presentationId/toggle-active')
  togglePresentationActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('presentationId', ParseUUIDPipe) presentationId: string,
  ) {
    return this.service.togglePresentationActive(id, presentationId);
  }

  @Patch(':id/presentations/:presentationId')
  updatePresentation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('presentationId', ParseUUIDPipe) presentationId: string,
    @Body() dto: UpdatePresentationDto,
  ) {
    return this.service.updatePresentation(id, presentationId, dto);
  }

  @Delete(':id/presentations/:presentationId')
  removePresentation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('presentationId', ParseUUIDPipe) presentationId: string,
  ) {
    return this.service.removePresentation(id, presentationId);
  }
}
