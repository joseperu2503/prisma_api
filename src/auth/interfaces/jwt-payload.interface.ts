import { ClientType } from '../enums/client-type.enum';
import { RoleId } from '../enums/role-id.enum';

export interface JwtPayload {
  userId: string;
  personId: string;
  client: ClientType;
  roles: RoleId[];
  names: string;
  paternalLastName: string;
  maternalLastName: string;
}
