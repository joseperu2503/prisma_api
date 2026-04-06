import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { BulkChargeDto } from 'src/enrollment/dto/bulk-charge.dto';
import { ChargeService } from './charge.service';
import { ListChargesDto } from './dto/list-charges.dto';

@Auth([RoleId.ADMIN])
@Controller('charges')
export class ChargeController {
  constructor(private readonly chargeService: ChargeService) {}

  @Post('list')
  findAll(@Body() dto: ListChargesDto) {
    return this.chargeService.findAll(dto);
  }

  @Post('bulk')
  bulkCharge(@Body() dto: BulkChargeDto) {
    return this.chargeService.bulkCharge(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chargeService.findOne(id);
  }
}
