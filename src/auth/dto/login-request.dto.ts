import { IsIn, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  documentNumber: string;

  @IsString()
  password: string;
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
