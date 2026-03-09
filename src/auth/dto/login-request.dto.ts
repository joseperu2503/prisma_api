import { IsEnum, IsIn, IsString } from 'class-validator';
import { ClientType } from '../enums/client-type.enum';

export class LoginRequestDto {
  @IsString()
  documentNumber: string;

  @IsString()
  password: string;

  @IsEnum(ClientType)
  client: ClientType;
}

export class LoginGoogleRequestDto {
  @IsString()
  token: string;
}

export class LoginFacebookRequestDto {
  @IsString()
  token: string;

  @IsString()
  @IsIn(['android', 'ios'])
  platform: 'android' | 'ios';
}
