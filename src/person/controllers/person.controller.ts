import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PersonService } from '../services/person.service';

@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get('by-document')
  async findByDocument(
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
        .json({
          message: 'Debe proporcionar números de documento de personas',
        });
    }

    const personDocumentNumbers = documentNumbers.split(',');
    const buffer = await this.personService.generateQrPdf(
      personDocumentNumbers,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=people_qrs.pdf',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
