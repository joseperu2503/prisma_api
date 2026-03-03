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
    const isExist = await this.documentTypeRepository.findOne({
      where: { id },
    });

    if (isExist) {
      // Actualizar el registro existente
      isExist.name = name;

      return this.documentTypeRepository.save(isExist);
    } else {
      // Crear un nuevo registro
      const newDocumentType = this.documentTypeRepository.create(params);
      return this.documentTypeRepository.save(newDocumentType);
    }
  }
}
