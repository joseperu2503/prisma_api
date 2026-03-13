import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AppPlatformId } from '../enums/app-platform-id.enum';

export class CreateAppVersionDto {
  @IsEnum(AppPlatformId)
  appPlatformId: AppPlatformId;

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
