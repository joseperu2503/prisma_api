import { Body, Controller, HttpCode, Patch, Post } from '@nestjs/common';
import { Auth } from '../decorators/auth.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { ChangePasswordDto } from '../dto/change-password.dto';
import {
  LoginFacebookRequestDto,
  LoginGoogleRequestDto,
  LoginRequestDto,
} from '../dto/login-request.dto';
import { User } from '../entities/user.entity';
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

  @Auth()
  @Patch('change-password')
  async changePassword(@GetUser() user: User, @Body() dto: ChangePasswordDto) {
    console.log('user', user);
    await this.authService.changePassword(user.id, dto);
    return { success: true, message: 'Contraseña actualizada correctamente' };
  }
}
