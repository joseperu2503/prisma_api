import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { AuthResponseDto } from '../dto/auth-response.dto';
import {
  LoginFacebookRequestDto,
  LoginGoogleRequestDto,
  LoginRequestDto,
} from '../dto/login-request.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { UserEntity } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../models/user.model';
import { FacebookService } from './facebook.service';
import { GoogleService } from './google.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly facebookService: FacebookService,
    private readonly googleService: GoogleService,
  ) {}

  async register(params: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const { password, ...userData } = params;

      const exist = await manager.findOne(UserEntity, {
        where: { email: userData.email },
      });
      if (exist) {
        throw new BadRequestException('Email already exists');
      }

      const user = manager.create(UserEntity, {
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await manager.save(user);

      return this.buildAuthResponse(user);
    });
  }

  async login(params: LoginRequestDto) {
    const { password, email } = params;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    //si el usuario con el email no existe
    if (!user) {
      throw new UnauthorizedException(`Credentials are not valid`);
    }

    //si la contraseña es incorrecta
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException(`Credentials are not valid`);
    }

    return this.buildAuthResponse(user);
  }

  async loginGoogle(params: LoginGoogleRequestDto): Promise<AuthResponseDto> {
    const { token } = params;

    const email = await this.googleService.validateToken(token);

    if (!email) {
      throw new UnauthorizedException(`Invalid token`);
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(`Unregistered user`);
    }

    return this.buildAuthResponse(user);
  }

  async loginFacebook(params: LoginFacebookRequestDto): Promise<AuthResponseDto> {
    const { token: accessToken, platform } = params;

    const email: string | null = await this.facebookService.validateToken(
      accessToken,
      platform,
    );

    if (!email) {
      throw new UnauthorizedException(`Invalid token`);
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(`Unregistered user`);
    }

    return this.buildAuthResponse(user);
  }

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private buildAuthResponse(user: User): AuthResponseDto {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token: this.getJwt({ id: user.id }),
    };
  }
}
