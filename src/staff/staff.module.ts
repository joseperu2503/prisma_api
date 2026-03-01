import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';

@Module({
  controllers: [],
  providers: [],
  imports: [TypeOrmModule.forFeature([Staff])],
  exports: [],
})
export class StaffModule {}
