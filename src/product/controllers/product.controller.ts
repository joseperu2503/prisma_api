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
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { Repository } from 'typeorm';
import { CreateProductPriceDto } from '../dto/create-product-price.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { ListProductDto } from '../dto/list-product.dto';
import { UpdateProductPriceDto } from '../dto/update-product-price.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { IgvAffectationType } from '../entities/igv-affectation-type.entity';
import { UnitCode } from '../entities/unit-code.entity';
import { ProductService } from '../services/product.service';

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

  // Prices

  @Post(':id/prices')
  addPrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductPriceDto,
  ) {
    return this.service.addPrice(id, dto);
  }

  @Patch(':id/prices/:priceId/toggle-active')
  togglePriceActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('priceId', ParseUUIDPipe) priceId: string,
  ) {
    return this.service.togglePriceActive(id, priceId);
  }

  @Patch(':id/prices/:priceId')
  updatePrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('priceId', ParseUUIDPipe) priceId: string,
    @Body() dto: UpdateProductPriceDto,
  ) {
    return this.service.updatePrice(id, priceId, dto);
  }

  @Delete(':id/prices/:priceId')
  removePrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('priceId', ParseUUIDPipe) priceId: string,
  ) {
    return this.service.removePrice(id, priceId);
  }
}
