import { Body, Controller, Delete, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ClientType } from 'src/auth/enums/client-type.enum';
import { RegisterFcmTokenDto } from '../dto/register-fcm-token.dto';
import { NotificationsService } from '../services/notifications.service';

@Auth(undefined, [ClientType.APP])
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('fcm-token')
  registerToken(@Req() req: Request, @Body() dto: RegisterFcmTokenDto) {
    const userId = (req.user as any).id as string;
    return this.notificationsService.registerToken(userId, dto);
  }

  @Delete('fcm-token/:token')
  removeToken(@Param('token') token: string) {
    return this.notificationsService.removeToken(token);
  }
}
