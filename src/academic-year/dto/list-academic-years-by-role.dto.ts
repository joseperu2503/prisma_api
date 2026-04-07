import { IsEnum } from 'class-validator';
import { RoleId } from 'src/auth/enums/role-id.enum';

export class ListAcademicYearsByRoleDto {
  @IsEnum(RoleId)
  role: RoleId;
}
