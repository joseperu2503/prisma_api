import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'test1@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Abc123',
  })
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
