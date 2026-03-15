import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ClientType } from '../enums/client-type.enum';
import { RoleId } from '../enums/role-id.enum';
import { ClientGuard, CLIENTS_KEY } from '../guards/client.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ROLES_KEY, RolesGuard } from '../guards/roles.guard';

export function Auth(roles?: RoleId[], clients?: ClientType[]) {
  const decorators = [UseGuards(JwtAuthGuard, RolesGuard, ClientGuard)];

  if (roles) decorators.push(SetMetadata(ROLES_KEY, roles));
  if (clients) decorators.push(SetMetadata(CLIENTS_KEY, clients));

  return applyDecorators(...decorators);
}
