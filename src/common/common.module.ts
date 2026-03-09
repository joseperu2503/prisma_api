import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentTypeController } from './controllers/document-type.controller';
import { DocumentType } from './entities/document-type.entity';
import { Gender } from './entities/gender.entity';
import { RelationshipType } from './entities/relationship-type.entity';
import { DocumentTypeService } from './services/document-type.service';

@Module({
  controllers: [DocumentTypeController],
  providers: [DocumentTypeService],
  imports: [TypeOrmModule.forFeature([Gender, DocumentType, RelationshipType])],
  exports: [TypeOrmModule],
})
export class CommonModule {}
