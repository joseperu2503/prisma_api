import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { ClassAcademicYearDto } from 'src/class-academic-year/dto/class-academic-year.dto';
import { CreateClassProductPriceDto } from 'src/class-academic-year/dto/create-product-price.dto';
import { UpdateClassProductPriceDto } from 'src/class-academic-year/dto/update-product-price.dto';
import { ListClassAcademicYearPricesDto } from '../dto/list-class-academic-year-prices.dto';
import { ProductPriceService } from '../services/product-price.service';

@Auth([RoleId.ADMIN])
@Controller('product-prices')
export class ProductPriceController {
  constructor(private readonly service: ProductPriceService) {}

  @Post('class-academic-year/available-products')
  findAvailableProducts(@Body() dto: ClassAcademicYearDto) {
    return this.service.findAvailableProducts(dto.classId, dto.academicYearId);
  }

  @Post('class-academic-year/list')
  findByClassAndYear(@Body() dto: ListClassAcademicYearPricesDto) {
    return this.service.findByClassAndYear(dto.classId, dto.academicYearId);
  }

  @Post('class-academic-year/create')
  createProductPrice(@Body() dto: CreateClassProductPriceDto) {
    return this.service.createClassAcademicYearPrice({
      productId: dto.productId,
      classId: dto.classId,
      academicYearId: dto.academicYearId,
      price: dto.price,
    });
  }

  @Patch(':id/update')
  updateProductPrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassProductPriceDto,
  ) {
    return this.service.updateClassAcademicYearPrice(id, dto.price);
  }

  @Delete(':id/remove')
  removeProductPrice(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
