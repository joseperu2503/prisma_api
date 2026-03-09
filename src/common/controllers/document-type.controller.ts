import { Controller, Get } from '@nestjs/common';
import { DocumentTypeService } from '../services/document-type.service';

@Controller('document-types')
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Get()
  findAll() {
    return this.documentTypeService.findAll();
  }
}
