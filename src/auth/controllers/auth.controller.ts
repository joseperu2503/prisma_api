import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import {
  LoginFacebookRequestDto,
  LoginGoogleRequestDto,
  LoginRequestDto,
} from '../dto/login-request.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() request: LoginRequestDto) {
    return this.authService.login(request);
  }

  @Post('login-google')
  loginGoogle(@Body() request: LoginGoogleRequestDto) {
    return this.authService.loginGoogle(request);
  }

  @Post('login-facebook')
  loginFacebook(@Body() request: LoginFacebookRequestDto) {
    return this.authService.loginFacebook(request);
  }
}
