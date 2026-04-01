import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { SaleController } from './controllers/sale.controller';
import { SaleInstallment } from './entities/sale-installment.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Sale } from './entities/sale.entity';
import { SaleService } from './services/sale.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem, SaleInstallment]),
    AuthModule,
  ],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}
