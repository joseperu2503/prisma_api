import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePlatformVersionDto {
  @IsString()
  platformTypeId: string;

  @IsString()
  version: string;

  @IsString()
  @IsOptional()
  build?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
