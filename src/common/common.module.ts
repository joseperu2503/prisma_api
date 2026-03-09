import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/auth/entities/role.entity';
import { DocumentTypeController } from './controllers/document-type.controller';
import { RoleController } from './controllers/role.controller';
import { DocumentType } from './entities/document-type.entity';
import { Gender } from './entities/gender.entity';
import { RelationshipType } from './entities/relationship-type.entity';
import { DocumentTypeService } from './services/document-type.service';
import { RoleService } from './services/role.service';

@Module({
  controllers: [DocumentTypeController, RoleController],
  providers: [DocumentTypeService, RoleService],
  imports: [
    TypeOrmModule.forFeature([Gender, DocumentType, RelationshipType, Role]),
  ],
  exports: [TypeOrmModule],
})
export class CommonModule {}
