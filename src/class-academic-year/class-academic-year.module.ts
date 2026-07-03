import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProductModule } from 'src/product/product.module';
import { ClassAcademicYearController } from './controllers/class-academic-year.controller';
import { DefaultProduct } from './entities/default-product.entity';
import { ClassAcademicYearService } from './services/class-academic-year.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DefaultProduct]),
    AuthModule,
    ProductModule,
  ],
  providers: [ClassAcademicYearService],
  controllers: [ClassAcademicYearController],
})
export class ClassAcademicYearModule {}
