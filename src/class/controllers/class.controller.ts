import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateClassDto } from '../dto/create-class.dto';
import { ListClassDto } from '../dto/list-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { ClassService } from '../services/class.service';

@Auth([RoleId.ADMIN])
@Controller('classes')
export class ClassController {
  constructor(private readonly service: ClassService) {}

  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.service.create(dto);
  }

  @Post('list')
  findAll(@Body() body: ListClassDto) {
    return this.service.findAll(body);
  }

  @Get('active')
  findActive() {
    return this.service.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.toggleActive(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateClassDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
