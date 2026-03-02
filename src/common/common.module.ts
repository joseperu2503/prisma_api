import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentType } from './entities/document-type.entity';
import { Gender } from './entities/gender.entity';

@Module({
  controllers: [],
  providers: [],
  imports: [TypeOrmModule.forFeature([Gender, DocumentType])],
  exports: [TypeOrmModule],
})
export class CommonModule {}
