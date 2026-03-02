import { RegisterRequestDto } from 'src/auth/dto/register-request.dto';

interface SeedData {
  users: RegisterRequestDto[];
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
};
