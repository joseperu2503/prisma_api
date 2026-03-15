import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ClientType } from 'src/auth/enums/client-type.enum';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { LevelService } from '../services/level.service';

@Auth([RoleId.ADMIN], [ClientType.WEB])
@Controller('levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  findAll() {
    return this.levelService.findAll();
  }
}
