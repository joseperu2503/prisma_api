import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAppVersionDto {
  @IsString()
  appPlatformId: string;

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
