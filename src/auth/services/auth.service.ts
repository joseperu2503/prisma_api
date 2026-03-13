import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthResponseDto } from '../dto/auth-response.dto';
import {
  LoginFacebookRequestDto,
  LoginGoogleRequestDto,
  LoginRequestDto,
} from '../dto/login-request.dto';
import { User } from '../entities/user.entity';
import { ClientType } from '../enums/client-type.enum';
import { RoleCode } from '../enums/role-code.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { FacebookService } from './facebook.service';
import { GoogleService } from './google.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly facebookService: FacebookService,
    private readonly googleService: GoogleService,
  ) {}

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

    const allowedByClient: Record<ClientType, RoleCode[]> = {
      web: [RoleCode.ADMIN],
      app: [RoleCode.ADMIN, RoleCode.STUDENT],
    };

    const allowed = allowedByClient[client];

    if (!roleCodes.some((r) => allowed.includes(r))) {
      throw new UnauthorizedException(
        'El usuario no tiene permisos para acceder',
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
    client: ClientType = ClientType.WEB,
  ): AuthResponseDto {
    const roleCodes = user.person.personRoles.map((pr) => pr.role.code);

    return {
      user: {
        id: user.id,
        person: {
          names: user.person.names,
          paternalLastName: user.person.paternalLastName,
          maternalLastName: user.person.maternalLastName,
        },
        roles: roleCodes,
      },
      token: this.getJwt({
        userId: user.id,
        client,
        roles: roleCodes,
        personId: user.person.id,
        names: user.person.names,
        paternalLastName: user.person.paternalLastName,
        maternalLastName: user.person.maternalLastName,
      }),
    };
  }
}
