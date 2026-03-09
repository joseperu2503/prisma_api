import { IsIn, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  documentNumber: string;

  @IsString()
  password: string;

  @IsIn(['web', 'app'])
  client: 'web' | 'app';
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
