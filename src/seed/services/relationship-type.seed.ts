import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RelationshipType } from 'src/common/entities/relationship-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RelationshipTypeSeed {
  constructor(
    @InjectRepository(RelationshipType)
    private readonly relationshipTypeRepository: Repository<RelationshipType>,
  ) {}

  relationshipTypes = [
    { name: 'Padre' },
    { name: 'Madre' },
    { name: 'Abuelo/a' },
    { name: 'Tío/a' },
    { name: 'Padrino/Madrina' },
    { name: 'Hermano/a mayor' },
    { name: 'Otro' },
  ];

  async run() {
    for (const relationshipType of this.relationshipTypes) {
      await this.create(relationshipType);
    }
  }

  async create(params: Partial<RelationshipType>) {
    const { name } = params;

    const isExist = await this.relationshipTypeRepository.findOne({
      where: { name },
    });

    if (isExist) {
      return isExist;
    } else {
      const newRelationshipType =
        this.relationshipTypeRepository.create(params);
      return this.relationshipTypeRepository.save(newRelationshipType);
    }
  }
}
