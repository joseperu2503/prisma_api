import { RegisterRequestDto } from 'src/auth/dto/register-request.dto';
import { TrackingSessionStatusEnum } from 'src/common/enums/tracking-session-status.enum';

interface SeedData {
  users: RegisterRequestDto[];
  trackingSessionsStatuses: { id: string; name: string }[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'test1@gmail.com',
      name: 'Test 1',
      password: 'Abc123',
    },
    {
      email: 'test2@gmail.com',
      name: 'Test 2',
      password: 'Abc123',
    },
    {
      email: 'joseperu2503@gmail.com',
      name: 'Jose',
      password: 'Abc123',
    },
    {
      email: 'juniorp2503@hotmail.com',
      name: 'Jose',
      password: 'Abc123',
    },
  ],
  trackingSessionsStatuses: [
    {
      id: TrackingSessionStatusEnum.IN_PROGRESS,
      name: 'In progress',
    },
    {
      id: TrackingSessionStatusEnum.FINISHED,
      name: 'Finished',
    },
    {
      id: TrackingSessionStatusEnum.CANCELLED,
      name: 'Cancelled',
    },
  ],
};
