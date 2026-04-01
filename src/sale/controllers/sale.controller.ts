import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { ListSalesDto } from '../dto/list-sales.dto';
import { PayInstallmentDto } from '../dto/pay-installment.dto';
import { SaleService } from '../services/sale.service';

@Auth([RoleId.ADMIN])
@Controller('sales')
export class SaleController {
  constructor(private readonly svc: SaleService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll(@Query() dto: ListSalesDto) {
    return this.svc.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch('installments/:installmentId/pay')
  payInstallment(
    @Param('installmentId') id: string,
    @Body() dto: PayInstallmentDto,
  ) {
    return this.svc.payInstallment(id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.svc.cancel(id);
  }
}
