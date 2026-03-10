import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelController } from './controllers/level.controller';
import { Level } from './entities/level.entity';
import { LevelService } from './services/level.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level])],
  controllers: [LevelController],
  providers: [LevelService],
  exports: [LevelService, TypeOrmModule],
})
export class LevelModule {}
