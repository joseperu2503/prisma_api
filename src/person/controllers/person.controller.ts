import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreatePersonDto } from '../dto/create-person.dto';
import { ListPersonDto } from '../dto/list-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { PersonService } from '../services/person.service';

@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Auth([RoleId.ADMIN, RoleId.GUARDIAN, RoleId.STUDENT, RoleId.EMPLOYEE])
  @Get('me')
  getMe(@Req() req: Request) {
    const personId = (req.user as any).person.id as string;
    return this.personService.getMyPersonData(personId);
  }

  @Post('list')
  async list(@Body() dto: ListPersonDto) {
    return this.personService.list(dto);
  }

  @Post('create')
  async create(@Body() dto: CreatePersonDto) {
    await this.personService.createPerson(dto);
    return { success: true, message: 'Persona creada correctamente' };
  }

  @Get('by-document')
  findByDocument(
    @Query('documentTypeId') documentTypeId: string,
    @Query('documentNumber') documentNumber: string,
  ) {
    return this.personService.findByDocument(documentTypeId, documentNumber);
  }

  @Get('export/qrs')
  async exportQrs(
    @Query('documentNumbers') documentNumbers: string,
    @Res() res: Response,
  ) {
    if (!documentNumbers) {
      return res.status(400).json({
        message: 'Debe proporcionar números de documento de personas',
      });
    }

    const personDocumentNumbers = documentNumbers.split(',');
    const buffer = await this.personService.generateQrPdf(personDocumentNumbers);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=people_qrs.pdf',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const person = await this.personService.findOne(id);
    return {
      id: person.id,
      names: person.names,
      paternalLastName: person.paternalLastName,
      maternalLastName: person.maternalLastName,
      documentTypeId: person.documentTypeId,
      documentNumber: person.documentNumber,
      birthDate: person.birthDate ?? null,
      email: person.email ?? null,
      phone: person.phone ?? null,
      address: person.address ?? null,
      genderId: person.genderId ?? null,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePersonDto) {
    await this.personService.update(id, dto);
    return { success: true, message: 'Persona actualizada correctamente' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.personService.remove(id);
    return { success: true, message: 'Persona eliminada correctamente' };
  }
}
