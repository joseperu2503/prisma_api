export interface AuthResponseDto {
  user: {
    id: string;
    person: {
      names: string;
      paternalLastName: string;
      maternalLastName: string;
    };
    roles: string[];
  };
  token: string;
}
