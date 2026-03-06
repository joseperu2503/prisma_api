import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentType } from './entities/document-type.entity';
import { Gender } from './entities/gender.entity';
import { RelationshipType } from './entities/relationship-type.entity';

@Module({
  controllers: [],
  providers: [],
  imports: [TypeOrmModule.forFeature([Gender, DocumentType, RelationshipType])],
  exports: [TypeOrmModule],
})
export class CommonModule {}
