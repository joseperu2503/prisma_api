import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './controllers/product.controller';
import { IgvAffectationType } from './entities/igv-affectation-type.entity';
import { ProductPrice } from './entities/product-price.entity';
import { Product } from './entities/product.entity';
import { UnitCode } from './entities/unit-code.entity';
import { ProductService } from './services/product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductPrice, UnitCode, IgvAffectationType])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
