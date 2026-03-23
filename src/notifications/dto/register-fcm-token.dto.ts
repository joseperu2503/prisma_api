import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AppPlatformId } from 'src/app-version/enums/app-platform-id.enum';

export class RegisterFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(AppPlatformId)
  appPlatformId: AppPlatformId;
}
