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
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { FacebookService } from './facebook.service';
import { GoogleService } from './google.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly facebookService: FacebookService,
    private readonly googleService: GoogleService,
  ) {}

  async register(params: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const { password, ...userData } = params;

      const exist = await manager.findOne(User, {
        where: {
          person: {
            id: userData.personId,
          },
        },
      });

      if (exist) {
        throw new BadRequestException('El usuario ya existe');
      }

      const user = manager.create(User, {
        personId: userData.personId,
        password: bcrypt.hashSync(password, 10),
      });
      await manager.save(user);

      return this.buildAuthResponse(user);
    });
  }

  async login(params: LoginRequestDto) {
    const { password, documentNumber, client } = params;

    const user = await this.userRepository.findOne({
      where: { person: { documentNumber } },
      relations: {
        person: {
          personRoles: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(`Credenciales inválidas`);
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException(`Credenciales inválidas`);
    }

    const roleCodes = user.person.personRoles.map((pr) => pr.role.code);

    const allowedByClient: Record<string, string[]> = {
      web: ['ADMIN', 'STUDENT'],
      app: ['ADMIN', 'STUDENT'],
    };

    const allowed = allowedByClient[client] ?? [];
    if (!roleCodes.some((r) => allowed.includes(r))) {
      throw new UnauthorizedException(
        client === 'web'
          ? 'Solo los administradores pueden acceder a la plataforma web'
          : 'Solo estudiantes y administradores pueden acceder a la app',
      );
    }

    return this.buildAuthResponse(user, client);
  }

  async loginGoogle(params: LoginGoogleRequestDto): Promise<AuthResponseDto> {
    const { token } = params;

    const email = await this.googleService.validateToken(token);

    if (!email) {
      throw new UnauthorizedException(`Invalid token`);
    }

    const user = await this.userRepository.findOne({
      where: { person: { email } },
    });

    if (!user) {
      throw new UnauthorizedException(`Unregistered user`);
    }

    return this.buildAuthResponse(user);
  }

  async loginFacebook(
    params: LoginFacebookRequestDto,
  ): Promise<AuthResponseDto> {
    const { token: accessToken, platform } = params;

    const email: string | null = await this.facebookService.validateToken(
      accessToken,
      platform,
    );

    if (!email) {
      throw new UnauthorizedException(`Invalid token`);
    }

    const user = await this.userRepository.findOne({
      where: { person: { email } },
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

  private buildAuthResponse(
    user: User,
    client: 'web' | 'app' = 'web',
  ): AuthResponseDto {
    return {
      user: {
        id: user.id,
        person: {
          names: user.person.names,
          paternalLastName: user.person.paternalLastName,
          maternalLastName: user.person.maternalLastName,
        },
        roles: user.person.personRoles.map((pr) => pr.role?.code ?? pr.roleId),
      },
      token: this.getJwt({ id: user.id, client }),
    };
  }
}
