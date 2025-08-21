import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  LoginFacebookRequestDto,
  LoginGoogleRequestDto,
  LoginRequestDto,
} from '../dto/login-request.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email, password, name, surname, and phone.',
  })
  @ApiBody({
    type: RegisterRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  register(@Body() registerUserDto: RegisterRequestDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates a user with their email and password, returning an access token.',
  })
  @ApiBody({
    type: LoginRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid email or password.',
  })
  login(@Body() request: LoginRequestDto) {
    return this.authService.login(request);
  }

  @ApiExcludeEndpoint()
  @Post('login-google')
  loginGoogle(@Body() request: LoginGoogleRequestDto) {
    return this.authService.loginGoogle(request);
  }

  @ApiExcludeEndpoint()
  @Post('login-facebook')
  loginFacebook(@Body() request: LoginFacebookRequestDto) {
    return this.authService.loginFacebook(request);
  }
}
