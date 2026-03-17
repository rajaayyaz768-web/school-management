import apiClient from "@/lib/axios";
import type { AuthUser } from "@/store/authStore";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const loginApi = async (payload: { email: string; password: string }) => {
  const response = await apiClient.post<
    ApiResponse<{ user: AuthUser; accessToken: string; refreshToken: string }>
  >("/auth/login", payload);
  return response.data.data;
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const getMeApi = async (): Promise<AuthUser> => {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  return response.data.data;
};

export const refreshTokenApi = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await apiClient.post<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >("/auth/refresh-token", { refreshToken });
  return response.data.data;
};
