import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicProgramDto } from './create-academic-program.dto';

export class UpdateAcademicProgramDto extends PartialType(CreateAcademicProgramDto) {}
