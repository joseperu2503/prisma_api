import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientType } from '../enums/client-type.enum';
import { RoleCode } from '../enums/role-code.enum';
import { ClientGuard, CLIENTS_KEY } from '../guards/client.guard';
import { ROLES_KEY, RolesGuard } from '../guards/roles.guard';

export function Auth(roles?: RoleCode[], clients?: ClientType[]) {
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), RolesGuard, ClientGuard),
    roles ? SetMetadata(ROLES_KEY, roles) : () => {},
    clients ? SetMetadata(CLIENTS_KEY, clients) : () => {},
  );
}
