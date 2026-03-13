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
import { CreatePlatformVersionDto } from '../dto/create-platform-version.dto';
import { UpdatePlatformVersionDto } from '../dto/update-platform-version.dto';
import { PlatformVersionService } from '../services/platform-version.service';

@Controller('platform-versions')
export class PlatformVersionController {
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
  updateType(@Param('id') id: string, @Body() dto: { storeUrl?: string | null }) {
    return this.service.updateType(id, dto);
  }

  @Get()
  findAll(@Query('platformTypeId') platformTypeId?: string) {
    if (platformTypeId) {
      return this.service.findByPlatform(platformTypeId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlatformVersionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlatformVersionDto) {
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
