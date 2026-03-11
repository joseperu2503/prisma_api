import { ClientType } from '../enums/client-type.enum';
import { RoleCode } from '../enums/role-code.enum';

export interface JwtPayload {
  userId: string;
  personId: string;
  client: ClientType;
  roles: RoleCode[];
  names: string;
  paternalLastName: string;
  maternalLastName: string;
}
