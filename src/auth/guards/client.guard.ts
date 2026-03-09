import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const CLIENTS_KEY = 'clients';

@Injectable()
export class ClientGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedClients = this.reflector.getAllAndOverride<string[]>(
      CLIENTS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedClients || allowedClients.length === 0) return true;

    const user = context.switchToHttp().getRequest().user;
    const client: string = user?.client ?? '';

    if (!allowedClients.includes(client)) {
      throw new ForbiddenException(
        'Este endpoint no está disponible para este cliente',
      );
    }

    return true;
  }
}
