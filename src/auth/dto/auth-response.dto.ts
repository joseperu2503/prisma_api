export interface AuthResponseDto {
  user: {
    id: string;
    name: string;
  };
  token: string;
}
