import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonRole } from 'src/person/entities/person-role.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';
import { RoleId } from '../enums/role-id.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    private readonly dataSource: DataSource,
  ) {}

  async assignRole(personId: string, roleId: RoleId, runner?: QueryRunner) {
    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      const role = await queryRunner.manager.findOne(Role, {
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(
          `Role with id '${roleId}' not found. Run seed first.`,
        );
      }

      const existingPersonRole = await queryRunner.manager.findOne(PersonRole, {
        where: { personId: personId, roleId: role.id },
      });

      if (!existingPersonRole) {
        const personRole = queryRunner.manager.create(PersonRole, {
          personId: personId,
          roleId: role.id,
        });

        await queryRunner.manager.save(personRole);
      }

      if (!isExternalTransaction) {
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      if (!isExternalTransaction) {
        await queryRunner.rollbackTransaction();
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the role',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (!isExternalTransaction) {
        await queryRunner.release();
      }
    }
  }
}
