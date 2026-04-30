export interface LoginRequest {
  identifier: string; // email, roll number (students), or CNIC (parents)
  password: string;
  deviceToken?: string;
  userAgent?: string;
  clientIp?: string;
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
