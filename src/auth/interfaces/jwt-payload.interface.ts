import { RoleId } from '../enums/role-id.enum';

export interface JwtPayload {
  userId: string;
  personId: string;
  roles: RoleId[];
  names: string;
  paternalLastName: string;
  maternalLastName: string;
}
