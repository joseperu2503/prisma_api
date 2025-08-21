import { Body, Controller, Get, Post } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UserEntity } from 'src/auth/entities/user.entity';
import { CancelTrackingSessionRequest } from '../dto/cancel-tracking-session-request.dto';
import { FinishTrackingSessionRequest } from '../dto/finish-tracking-session-request.dto';
import { StartTrackingSessionRequest } from '../dto/start-tracking-session-request.dto';
import { TrackingService } from '../services/tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('start')
  @Auth()
  async startTrackingSession(
    @GetUser() user: UserEntity,
    @Body() request: StartTrackingSessionRequest,
  ) {
    return await this.trackingService.startTrackingSession({
      userId: user.id,
      destinationPlaceId: request.destinationPlaceId,
      radius: request.radius,
    });
  }

  @Post('finish')
  @Auth()
  async finishTrackingSession(
    @GetUser() user: UserEntity,
    @Body() request: FinishTrackingSessionRequest,
  ) {
    return this.trackingService.finishTrackingSession(
      request.trackingSessionId,
      user.id,
    );
  }

  @Post('cancel')
  @Auth()
  async cancelTrackingSession(
    @GetUser() user: UserEntity,
    @Body() request: CancelTrackingSessionRequest,
  ) {
    return this.trackingService.cancelTrackingSession(
      request.trackingSessionId,
      user.id,
    );
  }

  @Get('current')
  @Auth()
  async getCurrentTrackingSession(@GetUser() user: UserEntity) {
    return this.trackingService.getCurrentTrackingSession(user.id);
  }
}
