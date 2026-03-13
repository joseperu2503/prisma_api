import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
import { ErrorCode } from 'src/common/enums/error-code.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // console.log({ err, user, info, context });

    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException({
        message: 'Token expirado',
        code: ErrorCode.AUTH_TOKEN_EXPIRED,
        statusCode: 401,
      });
    }

    if (err) {
      throw new UnauthorizedException({
        message: 'Token inválido',
        code: ErrorCode.AUTH_TOKEN_INVALID,
        statusCode: 401,
      });
    }

    if (!user) {
      throw new UnauthorizedException({
        message: 'Debe enviar el token',
        code: ErrorCode.AUTH_TOKEN_MISSING,
        statusCode: 401,
      });
    }

    return user;
  }
}
