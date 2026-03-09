import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientGuard, CLIENTS_KEY } from '../guards/client.guard';
import { ROLES_KEY, RolesGuard } from '../guards/roles.guard';

export function Auth(roles?: string[], clients?: string[]) {
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), RolesGuard, ClientGuard),
    roles ? SetMetadata(ROLES_KEY, roles) : () => {},
    clients ? SetMetadata(CLIENTS_KEY, clients) : () => {},
  );
}
