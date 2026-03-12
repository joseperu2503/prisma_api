import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformVersionController } from './controllers/platform-version.controller';
import { PlatformType } from './entities/platform-type.entity';
import { PlatformVersion } from './entities/platform-version.entity';
import { PlatformVersionService } from './services/platform-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformVersion, PlatformType])],
  controllers: [PlatformVersionController],
  providers: [PlatformVersionService],
  exports: [TypeOrmModule, PlatformVersionService],
})
export class PlatformVersionModule {}
