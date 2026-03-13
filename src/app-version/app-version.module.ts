import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppVersionController } from './controllers/app-version.controller';
import { AppPlatform } from './entities/app-platform.entity';
import { AppVersion } from './entities/app-version.entity';
import { PlatformVersionService } from './services/app-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppVersion, AppPlatform])],
  controllers: [AppVersionController],
  providers: [PlatformVersionService],
  exports: [TypeOrmModule, PlatformVersionService],
})
export class AppVersionModule {}
