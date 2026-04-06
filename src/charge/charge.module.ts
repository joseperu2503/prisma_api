import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';
import { ChargeController } from './charge.controller';
import { ChargeService } from './charge.service';
import { ChargeItem } from './entities/charge-item.entity';
import { Charge } from './entities/charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Charge, ChargeItem]), ProductModule],
  controllers: [ChargeController],
  providers: [ChargeService],
  exports: [ChargeService],
})
export class ChargeModule {}
