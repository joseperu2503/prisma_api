import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { In, Repository } from 'typeorm';
import { RegisterFcmTokenDto } from '../dto/register-fcm-token.dto';
import { FcmToken } from '../entities/fcm-token.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepo: Repository<FcmToken>,
  ) {}

  async registerToken(userId: string, dto: RegisterFcmTokenDto): Promise<void> {
    await this.fcmTokenRepo.upsert(
      { userId, token: dto.token, appPlatformId: dto.appPlatformId },
      { conflictPaths: ['token'] },
    );
  }

  async removeToken(token: string): Promise<void> {
    await this.fcmTokenRepo.delete({ token });
  }

  async removeAllUserTokens(userId: string): Promise<void> {
    await this.fcmTokenRepo.delete({ userId });
  }

  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const tokens = await this.fcmTokenRepo.find({ where: { userId } });
    if (tokens.length === 0) return;

    const messages: admin.messaging.Message[] = tokens.map((t) => ({
      token: t.token,
      notification: { title, body },
      ...(data && { data }),
    }));

    try {
      const batchResponse = await admin.messaging().sendEach(messages);

      const invalidTokens: string[] = [];
      batchResponse.responses.forEach((response, index) => {
        if (!response.success) {
          const code = response.error?.code ?? '';
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[index].token);
          }
          this.logger.warn(
            `FCM send failed for token ${tokens[index].token}: ${code}`,
          );
        }
      });

      if (invalidTokens.length > 0) {
        await this.fcmTokenRepo.delete({ token: In(invalidTokens) });
      }
    } catch (error) {
      this.logger.error('Error sending FCM notifications', error);
    }
  }
}
