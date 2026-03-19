import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { AuthController } from './controllers/auth.controller';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { FacebookService } from './services/facebook.service';
import { GoogleService } from './services/google.service';
import { RoleService } from './services/role.service';
import { UserService } from './services/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    FacebookService,
    GoogleService,
    UserService,
    RoleService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      PersonRole,
      Permission,
      RolePermission,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN,
          },
        };
      },
    }),
    HttpModule,
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
    AuthService,
    UserService,
    RoleService,
  ],
})
export class AuthModule {}
