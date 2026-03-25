import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ClientType } from 'src/auth/enums/client-type.enum';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { CreatePersonDto } from '../dto/create-person.dto';
import { SearchPersonDto } from '../dto/search-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { PersonService } from '../services/person.service';

@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Auth([RoleId.ADMIN, RoleId.GUARDIAN, RoleId.STUDENT, RoleId.EMPLOYEE], [ClientType.APP])
  @Get('me')
  getMe(@Req() req: Request) {
    const personId = (req.user as any).person.id as string;
    return this.personService.getMyPersonData(personId);
  }

  @Post('search')
  search(@Body() dto: SearchPersonDto) {
    return this.personService.search(dto.query, dto.page, dto.limit);
  }

  @Post('create')
  create(@Body() dto: CreatePersonDto) {
    return this.personService.createPerson(dto);
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
      return res
        .status(400)
        .json({ message: 'Debe proporcionar números de documento de personas' });
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
  findOne(@Param('id') id: string) {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePersonDto) {
    return this.personService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.personService.remove(id);
  }
}
