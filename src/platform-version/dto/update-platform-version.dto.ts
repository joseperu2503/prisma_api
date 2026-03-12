import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformVersionDto } from './create-platform-version.dto';

export class UpdatePlatformVersionDto extends PartialType(CreatePlatformVersionDto) {}
