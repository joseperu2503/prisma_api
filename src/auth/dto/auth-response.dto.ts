export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}
