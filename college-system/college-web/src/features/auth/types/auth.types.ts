export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "PARENT"
  | "STUDENT";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    campusId: string | null;
    fullName: string;
  };
}

export interface MeResponse {
  id: string;
  email: string;
  role: UserRole;
  campusId: string | null;
  fullName: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
