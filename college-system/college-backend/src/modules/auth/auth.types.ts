export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface MeResponse {
  id: string;
  email: string;
  role: string;
  fullName: string;
}
