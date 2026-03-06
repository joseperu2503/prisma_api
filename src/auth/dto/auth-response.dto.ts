export interface AuthResponseDto {
  user: {
    id: string;
    person: {
      names: string;
      paternalLastName: string;
      maternalLastName: string;
    };
  };
  token: string;
}
