import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource, QueryRunner } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly dataSource: DataSource) {}

  async findOrCreate(personId: string, password: string, runner?: QueryRunner) {
    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      let user: User;

      const found = await queryRunner.manager.findOne(User, {
        where: { personId },
      });

      if (found) {
        user = found;
      } else {
        user = queryRunner.manager.create(User, {
          personId,
          password: bcrypt.hashSync(password, 10),
        });
        user = await queryRunner.manager.save(user);
      }

      if (!isExternalTransaction) {
        await queryRunner.commitTransaction();
      }

      return user;
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
          message: 'An error occurred while creating the user',
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
