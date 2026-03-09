import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    const { id, client } = payload;
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { person: { personRoles: { role: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Inactive user.');
    }

    const roles = user.person.personRoles.map((pr) => pr.role?.code ?? '');

    return { ...user, client, roles };
  }
}
