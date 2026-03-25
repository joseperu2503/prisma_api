import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleId } from '../enums/role-id.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ROLES_KEY, RolesGuard } from '../guards/roles.guard';

export function Auth(roles?: RoleId[]) {
  const decorators = [UseGuards(JwtAuthGuard, RolesGuard)];

  if (roles) decorators.push(SetMetadata(ROLES_KEY, roles));

  return applyDecorators(...decorators);
}
