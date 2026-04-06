import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './controllers/product.controller';
import { IgvAffectationType } from './entities/igv-affectation-type.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductPriceType } from './entities/product-price-type.entity';
import { Product } from './entities/product.entity';
import { UnitCode } from './entities/unit-code.entity';
import { ProductPriceService } from './services/product-price.service';
import { ProductService } from './services/product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductPrice, ProductPriceType, UnitCode, IgvAffectationType])],
  controllers: [ProductController],
  providers: [ProductService, ProductPriceService],
  exports: [ProductService, ProductPriceService, TypeOrmModule],
})
export class ProductModule {}
