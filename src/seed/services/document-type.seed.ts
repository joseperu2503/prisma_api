import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentType } from 'src/common/entities/document-type.entity';
import { Repository } from 'typeorm';

Injectable();
export class DocumentTypeSeed {
  constructor(
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
  ) {}

  documentTypes = [
    {
      id: 'dni',
      name: 'DNI',
    },
  ];

  async run() {
    for (const documentType of this.documentTypes) {
      await this.create(documentType);
    }
  }

  async create(params: DocumentType) {
    const { id, name } = params;

    // Verificar si el registro ya existe
    const existingCountry = await this.documentTypeRepository.findOne({
      where: { id },
    });

    if (existingCountry) {
      // Actualizar el registro existente
      existingCountry.name = name;

      return this.documentTypeRepository.save(existingCountry);
    } else {
      // Crear un nuevo registro
      const newDocumentType = this.documentTypeRepository.create(params);
      return this.documentTypeRepository.save(newDocumentType);
    }
  }
}
