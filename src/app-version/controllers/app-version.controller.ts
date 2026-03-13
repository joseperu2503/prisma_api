import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateAppVersionDto } from '../dto/create-app-version.dto';
import { UpdateAppVersionDto } from '../dto/update-app-version.dto';
import { PlatformVersionService } from '../services/app-version.service';

@Controller('app-versions')
export class AppVersionController {
  constructor(private readonly service: PlatformVersionService) {}

  @Get('validate')
  validate() {
    return { isValid: true };
  }

  @Get('types')
  findAllTypes() {
    return this.service.findAllTypes();
  }

  @Patch('types/:id')
  updateType(
    @Param('id') id: string,
    @Body() dto: { storeUrl?: string | null },
  ) {
    return this.service.updateType(id, dto);
  }

  @Get()
  findAll(@Query('appPlatformId') appPlatformId?: string) {
    if (appPlatformId) {
      return this.service.findByPlatform(appPlatformId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAppVersionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppVersionDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
