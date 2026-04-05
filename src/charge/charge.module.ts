import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargeController } from './charge.controller';
import { ChargeService } from './charge.service';
import { ChargeItem } from './entities/charge-item.entity';
import { Charge } from './entities/charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Charge, ChargeItem])],
  controllers: [ChargeController],
  providers: [ChargeService],
})
export class ChargeModule {}
